module github.com/linusHche/lounge/server

go 1.16

require (
	github.com/gorilla/websocket v1.4.2
	github.com/labstack/echo/v4 v4.2.2
	go.mongodb.org/mongo-driver v1.5.2
)

replace github.com/linusHche/lounge/server/controller => ./controller
