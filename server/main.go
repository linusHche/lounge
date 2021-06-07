package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
	"github.com/linusHche/lounge/server/controller"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type broadcastMsg struct {
	Sender  *User
	Content msg
}

type msg struct {
	Event string
	Value string
}

type Room struct {
	users     map[*User]string
	broadcast chan broadcastMsg
}

type User struct {
	room *Room
	conn *websocket.Conn
}

func (room *Room) handleRoomBroadcast() {
	for {
		bm := <-room.broadcast
		for c := range room.users {
			if c != bm.Sender {
				c.conn.WriteJSON(&bm.Content)
			}
		}

	}
}

var roomController *controller.RoomController

func main() {

	e := echo.New()

	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	client, err := mongo.Connect(ctx, clientOptions)
	roomDb := client.Database("lounge").Collection("room")
	roomController = controller.InitRoomController(roomDb)
	if err != nil {
		log.Fatal(err)
	}
	room := &Room{
		users:     make(map[*User]string),
		broadcast: make(chan broadcastMsg),
	}
	go room.handleRoomBroadcast()
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})

	e.GET("/ws", func(c echo.Context) error {
		return handleConnections(room, c.Response().Writer, c.Request())
	})

	e.PUT("/room/adduser", roomController.GetRoomInfo)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}
	e.Logger.Fatal(e.Start(":" + port))

}

func (user *User) handleEvents(m msg) {
	switch m.Event {
	case "register-user":
		user.room.users[user] = m.Value
	case "time-update":
		roomController.UpdateRoomTime(m.Value)
	case "play-video":
		roomController.UpdateRoomPlayStatus(false)
	case "pause-video":
		roomController.UpdateRoomPlayStatus(true)
	case "change-url":
		roomController.UpdateRoomURL(m.Value)
	}
}

func (user *User) handleCommunicationStream() {
	defer func() {
		roomController.RemoveUserFromRoom(user.room.users[user])
		delete(user.room.users, user)
		user.conn.Close()
	}()
	var m msg
	for {

		err := user.conn.ReadJSON(&m)
		if m.Event == "update-user" {
			var u controller.User
			m.Event = "update-room-state"
			json.Unmarshal([]byte(m.Value), &u)
			r := roomController.UpdateUserInRoomAndRetrieveRoomState(u)
			out, _ := json.Marshal(r)
			m.Value = string(out)
		}
		user.handleEvents(m)

		if err != nil {
			log.Println(err)
			break
		}

		var bm = broadcastMsg{Sender: user, Content: m}

		user.room.broadcast <- bm
	}

}

func handleConnections(room *Room, w http.ResponseWriter, r *http.Request) error {
	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
		// return r.Host == "localhost:5000"
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return err
	}

	user := &User{room: room, conn: conn}
	go user.handleCommunicationStream()
	return nil
}
