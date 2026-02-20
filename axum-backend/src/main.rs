use axum::{
    routing::{get, post},
    Router,
    response::{Json, IntoResponse},
    extract::{State, Json as AxumJson},
    http::StatusCode,
};
use axum::http::Method;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tower_http::cors::{Any, CorsLayer};
use sqlx::{postgres::PgPoolOptions, PgPool};
use std::env;
use dotenvy::dotenv;
use std::sync::Arc;
use tokio::net::TcpListener;

#[derive(Clone)]
struct AppState {
    db: Arc<PgPool>,
}

#[derive(Deserialize)]
struct CreateUser {
    name: String,
    email: String,
    password: String,
}

#[derive(Serialize)]
struct UserResponse {
    id: uuid::Uuid,
    name: String,
    email: String,
}

#[tokio::main]
async fn main() -> Result<(), sqlx::Error> {
    dotenv().ok();

    let database_url =
        env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    println!("Connected to Postgres successfully!");

    let state = AppState {
        db: Arc::new(pool),
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root))
        .route("/users", get(get_users).post(create_user))
        .with_state(state)
        .layer(cors);

    let listener = TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();

    println!("Server running on http://localhost:3000");

    axum::serve(listener, app).await.unwrap();

    Ok(())
}

// ---------------- Handlers ----------------

async fn root() -> &'static str {
    "Hisaab Backend is Live 🚀"
}

// GET /users
async fn get_users(
    State(state): State<AppState>
) -> Result<Json<Vec<UserResponse>>, StatusCode> {

    let rows = sqlx::query!(
        "SELECT id, name, email FROM users"
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let users = rows
        .into_iter()
        .map(|u| UserResponse {
            id: u.id,
            name: u.name,
            email: u.email,
        })
        .collect();

    Ok(Json(users))
}

// POST /users
async fn create_user(
    State(state): State<AppState>,
    AxumJson(payload): AxumJson<CreateUser>,
) -> Result<impl IntoResponse, StatusCode> {

    let user = sqlx::query!(
        "INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email",
        payload.name,
        payload.email,
        payload.password // ⚠️ later we hash this
    )
    .fetch_one(&*state.db)
    .await
    .map_err(|_| StatusCode::BAD_REQUEST)?;

    Ok(Json(UserResponse {
        id: user.id,
        name: user.name,
        email: user.email,
    }))
}