package main

import (
    "fmt"
    "log"
    "net/http"
    "os"
)

func main() {
    // Renderが提供するPORT環境変数を使用するか、デフォルトで8080を使用
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Hello from Go Backend on Render! Port: %s", port)
    })

    log.Printf("Server listening on :%s", port)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}
