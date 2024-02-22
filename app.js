const express = require('express')
const app = express()
const port = 3000
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173"
    }
});

// Database
const DB = {
    onlineUsers: [],
    usersHandChooses: []
}

let DbRockPaper = []

io.on("connection", (socket) => {
    // Push data to DB.onlineUsers
    DB.onlineUsers.push({
        username: socket.handshake.auth.username,
        socketId: socket.id
    })

    // Untuk mentriger user online setelah refresh ulang
    socket.on("user:get", () => {
        socket.emit("users:online", DB.onlineUsers)
    })

    io.emit("users:online", DB.onlineUsers)

    //  Logic untuk hompimpang dan eleminasi user
    socket.on("choose", (num) => {

        DB.onlineUsers = DB.onlineUsers.map(el => {
            if(el.socketId === socket.id) {
                el.usersHandChooses = num
            }

            return el
        })

        if(num === 1) {
            DB.usersHandChooses.push(num)
            console.log(DB.usersHandChooses, "<<HandChoos");
        } else if (num === 2) {
            DB.usersHandChooses.push(num)
            console.log(DB.usersHandChooses, "<<HandChoos");
        }

        if(DB.onlineUsers.length === DB.usersHandChooses.length) {
            let n1 = 0
            let n2 = 0

            DB.usersHandChooses.forEach(el => {
                if(el === 1) {
                    n1++
                } else if(el === 2) {
                    n2++
                }
            })

            let max = 0
            if(n1 < n2) {
                max = 2
            } else if(n1 > n2) {
                max = 1
            } else if (n1 === n2) {
                max = 0
            }

            if(max !== 0) {
                DB.onlineUsers = DB.onlineUsers.filter(el => {
                    return el.usersHandChooses === max
                })
            }

            console.log(DB.onlineUsers, "<<Online Users Setelah Eleminasi");

            DB.usersHandChooses = []

            io.emit("choose:hand", max)
        }
    })

    // Login untuk Cutter Rock Paper
    socket.on("stone:paper", (num) => {
        DbRockPaper.push({
            username: socket.handshake.auth.username,
            socketId: socket.id,
            num: num
        })

        let win
        if(DbRockPaper.length === 2) {
            
            if(DbRockPaper[0].num === 3 && DbRockPaper[1].num === 4) {
                win = DbRockPaper[1]
            } else if (DbRockPaper[0].num === 4 && DbRockPaper[1].num === 5) {
                win = DbRockPaper[1]
            } else if (DbRockPaper[0].num === 5 && DbRockPaper[1].num === 3) {
                win = DbRockPaper[1]
            } else if (DbRockPaper[0].num === 4 && DbRockPaper[1].num === 3) {
                win = DbRockPaper[0]
            } else if (DbRockPaper[0].num === 5 && DbRockPaper[1].num === 4) {
                win = DbRockPaper[0]
            } else if (DbRockPaper[0].num === 3 && DbRockPaper[1].num === 5) {
                win = DbRockPaper[0]
            }

            DB.onlineUsers = DB.onlineUsers.filter(el => {
                return el.socketId === win.socketId
            })


            DbRockPaper = []
            io.emit("win:rockpaper", win)
        }

        console.log(win, "<<Win Server");
        
        console.log(DbRockPaper, "<<DbRockPaper");
    })
    


    socket.on("disconnect", () => {
        DB.onlineUsers = DB.onlineUsers.filter((el) => el.socketId !== socket.id);
    
        io.emit("users:online", DB.onlineUsers);
    });
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})


httpServer.listen(port);
// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })