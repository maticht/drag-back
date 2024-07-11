const { User } = require("../../models/user");
const { Task } = require("../../models/task");
const bot = require("../../bot");
const mongoose = require('mongoose');
const rewardTemplateData = require('../../eggsTemplateData/rewardsTemplateData.json')
const {addToBuffer} = require("../../utils/clickHouse/dataBuffer");

class TaskController {
    async getTasks(req, res) {
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'completedTasks');
            const allTasks = await Task.find();

            const tasksWithStatus = allTasks.map(task => {
                const done = user.completedTasks.some(completedTask => completedTask.id.toString() === task._id.toString() && completedTask.isCompleted);
                let attemptsNumber = 0;
                if (done){
                    attemptsNumber = user.completedTasks.find(completedTask => completedTask.id.toString() === task._id.toString()).attemptsNumber;
                }
                return { ...task.toObject(), done, attemptsNumber };
            });

            return res.json({ tasks: tasksWithStatus });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    }

    async createTask(req, res) {
        try {
            const { title, description, reward, link, checkable } = req.body;
            const task = new Task({ title, description, reward, link, checkable });
            await task.save();
            return res.json({ message: `Task "${task.title}" created successfully` });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    }

    async completeTask(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'completedTasks score overallScore profileLevel username').session(session);
            const profileLevel = user.profileLevel;
            if (!user) {
                res.status(400).send({success: false, message: "User not found" });
                await session.abortTransaction();
                session.endSession();
                return;
            }

            const task = await Task.findById(req.body.taskId).session(session);
            if (!task) {
                res.status(400).send({success: false, message: "Task not found" });
                await session.abortTransaction();
                session.endSession();
                return;
            }

            const completedTask = user.completedTasks.find(task => task.id === req.body.taskId);

            if (completedTask && completedTask.isCompleted === true) {
                res.status(400).send({success: false, message: "Task already completed" });
                await session.abortTransaction();
                session.endSession();
                return;
            }else if(!completedTask){
                res.status(400).send({success: false, message: "Condition not done" });
                await session.abortTransaction();
                session.endSession();
                return;
            }else if(completedTask.attemptsNumber < 1){
                res.status(400).send({success: false, message: "Condition not done" });
                await session.abortTransaction();
                session.endSession();
                return;
            }else{
                user.score += rewardTemplateData.tasksReward[profileLevel -1];
                user.overallScore += rewardTemplateData.tasksReward[profileLevel -1];

                completedTask.isCompleted = true;
                await user.save({ session });

                await session.commitTransaction();
                session.endSession();

                const userAgentString = req.headers['user-agent'];
                addToBuffer(req.params.userId, user.username, `complete task ${req.body.taskId}`, userAgentString, user.score);

                return res.json({
                    success: true,
                    message: `Task completed successfully`,
                    score: user.score,
                    overallScore: user.overallScore,
                    completedTaskId: req.body.taskId
                });
            }

            // user.score += task.reward * rewardTemplateData.RewardCoefficient[profileLevel];
            // user.overallScore += task.reward * rewardTemplateData.RewardCoefficient[profileLevel];

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.log(error);
            res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    }

    async checkAndCompleteTask(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'completedTasks score overallScore profileLevel').session(session);

            if (!user) {
                res.status(400).send({success: false, message: "User not found" });
                await session.abortTransaction();
                session.endSession();
                return;
            }

            const task = await Task.findById(req.body.taskId).session(session);
            if (!task) {
                res.status(400).send({success: false, message: "Task not found" });
                await session.abortTransaction();
                session.endSession();
                return;
            }

            const completedTask = user.completedTasks.find(task => task.id === req.body.taskId && task.isCompleted === true);

            if (completedTask) {
                res.status(400).send({success: false, message: "Task already completed" });
                await session.abortTransaction();
                session.endSession();
                return;
            }

            const channelUsername = task.link.split('t.me/')[1]; // Получаем имя канала из ссылки

            const chatMember = await bot.getChatMember(`@${channelUsername}`, req.params.userId);
            if (chatMember.status === 'left' || chatMember.status === 'kicked') {
                res.status(400).send({success: false, message: "User is not a member of the channel" });
                await session.abortTransaction();
                session.endSession();
                return;
            }

            user.score += rewardTemplateData.tasksReward[user.profileLevel -1];
            user.overallScore += rewardTemplateData.tasksReward[user.profileLevel -1];

            user.completedTasks.push({
                id: task.id.toString(),
                attemptsNumber: 1,
                isCompleted: true,
            });
            await user.save({ session });

            await session.commitTransaction();
            session.endSession();

            return res.json({
                success: true,
                message: `Task completed successfully`,
                score: user.score,
                overallScore: user.overallScore,
                completedTaskId: req.body.taskId
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.log(error);
            res.status(500).send({success: false, message: "Внутренняя ошибка сервера" });
        }
    }

    async updateAttemptsNumber(req, res) {
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'completedTasks');

            if (!user) {
                res.status(400).send({success: false, message: "User not found" });
                return;
            }

            const completedTask = user.completedTasks.find(task => task.id === req.body.taskId);

            if(!completedTask){
                user.completedTasks.push({
                    id: req.body.taskId,
                    attemptsNumber: 1,
                    isCompleted: false,
                });
            }else{
                completedTask.attemptsNumber += 1;
            }

            await user.save();

            return res.json({ success: true});
        } catch (error) {
            console.error("Failed to update attempts number:", error);
            return res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    }
}

module.exports = new TaskController();