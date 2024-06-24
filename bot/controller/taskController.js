const { User } = require("../../models/user");
const { Task } = require("../../models/task");
const mongoose = require('mongoose');

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
            const { title, description, reward, link } = req.body;
            const task = new Task({ title, description, reward, link });
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
            const user = await User.findOne({ chatId: req.params.userId }, 'completedTasks score overallScore').session(session);
            if (!user) {
                throw new Error("User not found");
            }

            const task = await Task.findById(req.body.taskId).session(session);
            if (!task) {
                throw new Error("Task not found");
            }

            if (user.completedTasks.includes(req.body.taskId)) {
                throw new Error("Task already completed");
            }

            user.score += task.reward;
            user.overallScore += task.reward;

            user.completedTasks.push(req.body.taskId);
            await user.save({ session });

            await session.commitTransaction();
            session.endSession();

            return res.json({
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
}

module.exports = new TaskController();