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
        }
    ]
};
