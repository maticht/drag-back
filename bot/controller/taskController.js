const { User } = require("../../models/user");
const { Task } = require("../../models/task");
const bot = require("../../bot");
const mongoose = require('mongoose');
const rewardTemplateData = require('../../eggsTemplateData/rewardsTemplateData.json')

class TaskController {
    async getTasks(req, res) {
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'completedTasks');
            const allTasks = await Task.find();

            const tasksWithStatus = allTasks.map(task => {
                const done = user.completedTasks.some(completedTask => completedTask.toString() === task._id.toString());
                return { ...task.toObject(), done };
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
            const user = await User.findOne({ chatId: req.params.userId }, 'completedTasks score overallScore profileLevel').session(session);
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

            if (user.completedTasks.includes(req.body.taskId)) {
                res.status(400).send({success: false, message: "Task already completed" });
                await session.abortTransaction();
                session.endSession();
                return;
            }

            // user.score += task.reward * rewardTemplateData.RewardCoefficient[profileLevel];
            // user.overallScore += task.reward * rewardTemplateData.RewardCoefficient[profileLevel];

            user.score += rewardTemplateData.tasksReward[profileLevel -1];
            user.overallScore += rewardTemplateData.tasksReward[profileLevel -1];

            user.completedTasks.push(req.body.taskId);
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
            res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    }

    async checkAndCompleteTask(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'completedTasks score overallScore').session(session);

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

            if (user.completedTasks.includes(req.body.taskId)) {
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

            user.score += task.reward;
            user.overallScore += task.reward;

            user.completedTasks.push(req.body.taskId);
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
            const taskId = req.body.taskId;
            const updatedTask = await Task.findByIdAndUpdate(
                taskId,
                { $inc: { attemptsNumber: 1 } },
                { new: true }
            );

            if (!updatedTask) {
                return res.status(404).json({ success: false, message: "Task not found" });
            }

            return res.json({ success: true});
        } catch (error) {
            console.error("Failed to update attempts number:", error);
            return res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    }
}

module.exports = new TaskController();