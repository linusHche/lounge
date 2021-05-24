package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
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

type msg struct {
	Event string
	Value string
}

type Room struct {
	users      map[*User]bool
	mu         sync.Mutex
	controller *controller.RoomController
}

type User struct {
	room *Room
	conn *websocket.Conn
}

func main() {

	e := echo.New()

	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	client, err := mongo.Connect(ctx, clientOptions)
	roomDb := client.Database("lounge").Collection("room")
	roomController := controller.InitRoomController(roomDb)
	if err != nil {
		log.Fatal(err)
	}
	room := &Room{
		users:      make(map[*User]bool),
		controller: roomController,
	}

	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})

	e.GET("/ws", func(c echo.Context) error {
		return handleConnections(room, c.Response().Writer, c.Request())
	})

	e.PUT("/room/adduser", roomController.GetRoomInfo)
	e.PUT("/room/removeuser", roomController.RemoveUserFromRoom)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}
	e.Logger.Fatal(e.Start(":" + port))

}

func (user *User) handleEvents(m msg) {
	rc := user.room.controller
	switch m.Event {
	case "time-update":
		rc.UpdateRoomTime(m.Value)
	case "play-video":
		rc.UpdateRoomPlayStatus(false)
	case "pause-video":
		rc.UpdateRoomPlayStatus(true)
	case "change-url":
		rc.UpdateRoomURL(m.Value)
	}
}

func (user *User) handleCommunicationStream() {
	defer func() {
		fmt.Println("User Left")
		user.conn.Close()
	}()
	var m msg
	for {

		err := user.conn.ReadJSON(&m)

		if m.Event == "update-user" {
			var u controller.User
			m.Event = "update-room-state"
			json.Unmarshal([]byte(m.Value), &u)
			user.room.controller.UpdateUserInRoomAndRetriveRoomState(u)
		}
		user.handleEvents(m)

		if err != nil {
			log.Println(err)
			delete(user.room.users, user)
			break
		}
		user.room.mu.Lock()
		for c := range user.room.users {
			if c != user {
				c.conn.WriteJSON(&m)
			}
		}
		user.room.mu.Unlock()
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
	room.users[user] = true
	go user.handleCommunicationStream()
	return nil
}
