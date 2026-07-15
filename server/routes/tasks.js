const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


// ================= GET ALL TASKS =================
router.get("/", async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });

        res.json(tasks);

    } catch (error) {
        console.error("LOAD TASK ERROR:", error);
        res.status(500).json({
            error: "Failed to load tasks"
        });
    }
});


// ================= CREATE TASK =================
router.post("/", async (req, res) => {
    try {
        const {
            donor,
            location,
            volume,
            status,
            userId
        } = req.body;


        // Check user ID
        if (!userId) {
            return res.status(400).json({
                error: "User ID is required"
            });
        }


        // Check user exists
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });


        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }


        const task = await prisma.task.create({
            data: {
                id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,

                taskId: `#SL-${Date.now().toString().slice(-6)}`,

                donor: donor,

                location: location,

                volume: volume,

                date: new Date()
                    .toISOString()
                    .split("T")[0],

                status: status || "Pending",

                userId: userId,

                createdAt: new Date(),

                updatedAt: new Date()
            }
        });


        res.status(201).json(task);


    } catch (error) {

        console.error("CREATE TASK ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
});



// ================= UPDATE TASK =================
router.put("/:id", async (req, res) => {
    try {

        const {
            donor,
            location,
            volume,
            status
        } = req.body;


        const task = await prisma.task.update({

            where: {
                id: req.params.id
            },

            data: {

                donor,

                location,

                volume,

                status,

                updatedAt: new Date()
            }
        });


        res.json(task);


    } catch (error) {

        console.error("UPDATE TASK ERROR:", error);

        res.status(500).json({
            error: "Failed to update task"
        });
    }
});



// ================= DELETE TASK =================
router.delete("/:id", async (req, res) => {

    try {

        await prisma.task.delete({

            where: {
                id: req.params.id
            }

        });


        res.json({
            message: "Task deleted successfully"
        });


    } catch (error) {

        console.error("DELETE TASK ERROR:", error);

        res.status(500).json({
            error: "Failed to delete task"
        });
    }

});


module.exports = router;