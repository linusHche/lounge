package controller

import (
	"context"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type RoomController struct {
	db *mongo.Collection
}

type Room struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Name      string             `json:"name" bson:"name"`
	Timestamp string             `json:"timestamp" bson:"timestamp"`
	IsPaused  bool               `json:"isPaused" bson:"isPaused"`
	Url       string             `json:"url" bson:"url"`
	Users     []User             `json:"users" bson:"users"`
}

type User struct {
	// UserId       primitive.ObjectID `bson:"userId"`
	Username     string `json:"username" bson:"username"`
	IsBuffering  bool   `json:"buffering" bson:"isBuffering"`
	IsCalibrated bool   `json:"calibrated" bson:"isCalibrated"`
}

func InitRoomController(db *mongo.Collection) *RoomController {
	return &RoomController{db}
}

func (rc *RoomController) GetRoomInfo(ctx echo.Context) error {
	var u User
	filter := bson.D{{"name", "main"}}
	if err := ctx.Bind(&u); err != nil {
		fmt.Println(err)
		return err
	}

	update := bson.M{
		"$push": bson.M{
			"users": u}}
	_, err := rc.db.UpdateOne(context.Background(), filter, update)
	if err != nil {
		fmt.Println(err)
	}

	var r Room
	rc.db.FindOne(context.Background(), filter).Decode(&r)
	ctx.JSON(http.StatusOK, &r)
	return nil
}

func (rc *RoomController) RemoveUserFromRoom(username string) error {
	filter := bson.D{{"name", "main"}}

	changes := bson.M{"$pull": bson.M{"users": bson.M{"username": username}}}
	_, err := rc.db.UpdateOne(context.Background(), filter, changes)
	if err != nil {
		fmt.Println(err)
	}
	return nil
}

func (rc *RoomController) UpdateRoomTime(time string) {
	filter := bson.D{{"name", "main"}}
	fmt.Println(time)
	_, err := rc.db.UpdateOne(context.Background(), filter, bson.M{"$set": bson.M{"timestamp": time}})
	if err != nil {
		fmt.Println(err)
	}
}

func (rc *RoomController) UpdateRoomPlayStatus(isPaused bool) {
	filter := bson.D{{"name", "main"}}
	rc.db.UpdateOne(context.Background(), filter, bson.M{"$set": bson.M{"isPaused": isPaused}})
}

func (rc *RoomController) UpdateRoomURL(url string) {
	filter := bson.D{{"name", "main"}}
	rc.db.UpdateOne(context.Background(), filter, bson.M{"$set": bson.M{"url": url}})
}

func (rc *RoomController) UpdateUserInRoomAndRetrieveRoomState(user User) Room {
	filter := bson.M{"name": "main", "users.username": user.Username}
	changes := bson.M{"$set": bson.M{"users.$": user}}
	var rd options.ReturnDocument = options.After
	opt := options.FindOneAndUpdateOptions{
		ReturnDocument: &rd,
	}
	var r Room
	rc.db.FindOneAndUpdate(context.Background(), filter, changes, &opt).Decode(&r)
	return r
}

func (rc *RoomController) RetrieveRoomStateByRoomName(roomName string) Room {
	filter := bson.M{"name": roomName}
	var r Room
	rc.db.FindOne(context.Background(), filter).Decode(&r)
	return r
}
