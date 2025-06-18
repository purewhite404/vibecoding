package main

import (
	"log"
	"net/http"
	"os"
	"sync" // 複数のクライアントを安全に扱うためのsyncパッケージ

	"github.com/gorilla/websocket"
)

// UpgraderはHTTP接続をWebSocket接続にアップグレードするために使用されます。
// 以下の設定はセキュリティのためにオリジンチェックを無効にしていますが、
// 本番環境では特定のオリジンのみを許可する設定を推奨します。
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// !!! ここを適切に設定する !!!
		// フロントエンドのURLを明示的に許可する必要があります。
		// 例えば、ローカル開発なら "http://localhost:3000"
		// Renderデプロイ後なら "https://your-frontend-url.onrender.com"
		// 本番では複数のオリジンを許可する場合はループなどでチェック
		allowedOrigins := map[string]bool{
			"http://localhost:3000": true, // フロントエンドの開発サーバーのURL
			"http://127.0.0.1:3000": true, // またはこれ
			// Renderデプロイ後のフロントエンドURLも追加
			"https://vibecoding-g4d4.onrender.com": true, // Renderデプロイ後の実際のURLに置き換え
		}
		origin := r.Header.Get("Origin")
		if _, ok := allowedOrigins[origin]; ok {
			return true
		}
		log.Printf("Blocked origin: %s", origin)
		return false
	},
}

// ClientManagerは接続されたWebSocketクライアントを管理します。
type ClientManager struct {
	clients      map[*websocket.Conn]bool // 接続されているクライアントのマップ
	sync.RWMutex                          // マップへの同時アクセスを保護するためのMutex
}

// NewClientManagerは新しいClientManagerを作成します。
func NewClientManager() *ClientManager {
	return &ClientManager{
		clients: make(map[*websocket.Conn]bool),
	}
}

// AddClientは新しいクライアントを追加します。
func (cm *ClientManager) AddClient(conn *websocket.Conn) {
	cm.Lock()
	defer cm.Unlock()
	cm.clients[conn] = true
	log.Printf("Client connected: %s. Total clients: %d", conn.RemoteAddr(), len(cm.clients))
}

// RemoveClientはクライアントを削除します。
func (cm *ClientManager) RemoveClient(conn *websocket.Conn) {
	cm.Lock()
	defer cm.Unlock()
	if _, ok := cm.clients[conn]; ok {
		delete(cm.clients, conn)
		conn.Close() // 接続をクローズ
		log.Printf("Client disconnected: %s. Total clients: %d", conn.RemoteAddr(), len(cm.clients))
	}
}

// BroadcastMessageは接続されているすべてのクライアントにメッセージをブロードキャストします。
func (cm *ClientManager) BroadcastMessage(message []byte) {
	cm.RLock()         // 読み込みロック
	defer cm.RUnlock() // deferでロック解除
	for client := range cm.clients {
		err := client.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Printf("Error writing to client %s: %v", client.RemoteAddr(), err)
			cm.RemoveClient(client) // エラーが発生したクライアントは削除
		}
	}
}

// websocketHandlerはWebSocket接続を処理します。
func websocketHandler(w http.ResponseWriter, r *http.Request, cm *ClientManager) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer func() {
		cm.RemoveClient(conn) // 接続が終了したら削除
	}()

	cm.AddClient(conn) // 新しいクライアントを追加

	// メッセージを読み込み、ブロードキャストするループ
	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
				log.Printf("Client %s closed connection gracefully.", conn.RemoteAddr())
			} else {
				log.Printf("Error reading message from client %s: %v", conn.RemoteAddr(), err)
			}
			break // エラーが発生したらループを抜ける
		}
		log.Printf("Received message from %s (type %d): %s", conn.RemoteAddr(), messageType, message)

		// 受信したメッセージを接続されているすべてのクライアントにブロードキャスト
		cm.BroadcastMessage(message)
	}
}

func main() {
	// クライアントマネージャーを初期化
	manager := NewClientManager()

	// WebSocketハンドラを設定
	// クロージャを使ってmanagerをハンドラに渡す
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		websocketHandler(w, r, manager)
	})

	// ポートを設定（Renderの環境変数PORTを優先）
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // ローカル開発用のデフォルトポート
	}

	log.Printf("Server starting on :%s", port)
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
