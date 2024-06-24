const {User} = require("../../models/user");
const mongoose = require('mongoose');

class UserController {
    async getUserData(req, res){
        try {
            const user = await User.findOne({ chatId: req.params.userId });
            console.log(req.params.userId)
            if (!user) return res.status(400).send({ message: "Invalid queryId" });
            return res.json({user})
        } catch (error) {
            res.status(500).send({ message: "Internal Server Error" });
        }
    }

    async getAllUsers(req, res){
        try {
            const users = await User.find({}, 'overallScore username').sort({ overallScore: -1 });
            res.send(users);
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }

    // async getUserTopPlace(req, res) {
    //     try {
    //         const userId = req.params.userId;
    //
    //         const result = await User.aggregate([
    //             {
    //                 $match: { chatId: userId }
    //             },
    //             {
    //                 $lookup: {
    //                     from: 'users',
    //                     let: { score: "$overallScore" },
    //                     pipeline: [
    //                         {
    //                             $match: {
    //                                 $expr: {
    //                                     $gt: ["$overallScore", "$$score"]
    //                                 }
    //                             }
    //                         },
    //                         {
    //                             $count: "rank"
    //                         }
    //                     ],
    //                     as: 'rank'
    //                 }
    //             },
    //             {
    //                 $addFields: {
    //                     userTopPlace: {
    //                         $add: [{ $arrayElemAt: ["$rank.rank", 0] }, 1]
    //                     }
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     chatId: 1,
    //                     overallScore: 1,
    //                     userTopPlace: 1
    //                 }
    //             }
    //         ]);
    //
    //         if (result.length === 0) {
    //             return res.status(404).send({ message: "User not found" });
    //         }
    //
    //         const user = result[0];
    //
    //         // Обновляем поле userTopPlace в документе пользователя
    //         await User.updateOne({ chatId: userId }, { userTopPlace: user.userTopPlace });
    //
    //         return res.json({ user });
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).send({ message: "Internal Server Error" });
    //     }
    // }

    async getUserTopPlace(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'username userTopPlace score overallScore eggs').session(session);

            if (!user) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).send({ message: "User not found" });
            }

            const higherScoreCount = await User.countDocuments({ overallScore: { $gt: user.overallScore } }).session(session);

            const userTopPlace = higherScoreCount + 1;

            user.userTopPlace = userTopPlace;
            await user.save({ session });

            await session.commitTransaction();
            session.endSession();

            return res.json({ user });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error('Error fetching user top place:', error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }

    async updateWalletHash(req, res){
        try {
            const { userId } = req.params;
            const { auroraWalletHash } = req.body;

            if (!auroraWalletHash && auroraWalletHash !== "") {
                return res.status(400).send({ message: "Invalid wallet hash" });
            }

            const user = await User.findOneAndUpdate(
                { chatId: userId },
                { auroraWalletHash: auroraWalletHash || "" },
                { new: true, select: 'auroraWalletHash' }
            );

            if (!user) {
                return res.status(404).send({ message: "User not found" });
            }

            return res.json({ auroraWalletHash: user.auroraWalletHash });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }
}

module.exports = new UserController();