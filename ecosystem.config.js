module.exports = {
    apps: [
        {
            name: "app-master",
            script: "./app.js",
            instances: 1,
            exec_mode: "cluster",
            env: {
                NODE_ROLE: "MASTER"
            }
        },
        {
            name: "app-slave-1",
            script: "./app.js",
            instances: 1,
            exec_mode: "cluster",
            env: {
                NODE_ROLE: "SLAVE_1"
            }
        },
        {
            name: "app-slave-2",
            script: "./app.js",
            instances: 1,
            exec_mode: "cluster",
            env: {
                NODE_ROLE: "SLAVE_2"
            }
        },
        {
            name: "app-slave-3",
            script: "./app.js",
            instances: 1,
            exec_mode: "cluster",
            env: {
                NODE_ROLE: "SLAVE_3"
            }
        },
        {
            name: "app-slave-4",
            script: "./app.js",
            instances: 1,
            exec_mode: "cluster",
            env: {
                NODE_ROLE: "SLAVE_4"
            }
        },
        {
            name: "app-slave-5",
            script: "./app.js",
            instances: 1,
            exec_mode: "cluster",
            env: {
                NODE_ROLE: "SLAVE_5"
            }
        },
        {
            name: "app-slave-6",
            script: "./app.js",
            instances: 1,
            exec_mode: "cluster",
            env: {
                NODE_ROLE: "SLAVE_6"
            }
        },
        {
            name: "app-slave-7",
            script: "./app.js",
            instances: 1,
            exec_mode: "cluster",
            env: {
                NODE_ROLE: "SLAVE_7"
            }
        }
        // {
        //     name: "app-slave-8",
        //     script: "./app.js",
        //     instances: 1,
        //     exec_mode: "cluster",
        //     env: {
        //         NODE_ROLE: "SLAVE_8"
        //     }
        // },
        // {
        //     name: "app-slave-9",
        //     script: "./app.js",
        //     instances: 1,
        //     exec_mode: "cluster",
        //     env: {
        //         NODE_ROLE: "SLAVE_9"
        //     }
        // },
        // {
        //     name: "app-slave-10",
        //     script: "./app.js",
        //     instances: 1,
        //     exec_mode: "cluster",
        //     env: {
        //         NODE_ROLE: "SLAVE_10"
        //     }
        // }
    ]
};
