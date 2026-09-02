from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client
from dotenv import load_dotenv
import os

# ============================================================
# CAMPUSFIND - FLASK BACKEND
# ============================================================

# Load environment variables
load_dotenv()

# Create Flask application
app = Flask(__name__)
CORS(app)

# ============================================================
# SUPABASE CONFIGURATION
# ============================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")

if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL is missing from .env")

if not SUPABASE_KEY:
    raise ValueError("SUPABASE_KEY is missing from .env")

if not SUPABASE_PUBLISHABLE_KEY:
    raise ValueError("SUPABASE_PUBLISHABLE_KEY is missing from .env")


# Authentication client
supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

# Server/database client
db = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

# User/RLS client
user_db = create_client(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
)


# ============================================================
# AUTHENTICATION HELPER
# ============================================================

def get_current_user():
    """
    Get the currently authenticated Supabase user
    from the Authorization Bearer token.
    """

    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1].strip()

    if not token:
        return None

    try:
        response = supabase.auth.get_user(token)

        if response and response.user:
            return response.user

        return None

    except Exception:
        return None


# ============================================================
# HOME
# ============================================================

@app.route("/")
def home():
    return jsonify({
        "message": "CampusFind Backend is running!",
        "status": "success"
    })


# ============================================================
# DATABASE TEST
# ============================================================

@app.route("/api/test-db", methods=["GET"])
def test_database():
    try:
        db.table("items").select("*").limit(1).execute()

        return jsonify({
            "message": "Supabase connection successful!",
            "status": "success"
        }), 200

    except Exception as e:
        return jsonify({
            "message": "Supabase connection failed",
            "status": "error",
            "error": str(e)
        }), 500


# ============================================================
# CREATE ITEM
# ============================================================

@app.route("/api/items", methods=["POST"])
def create_item():
    try:
        # --------------------------------------------------------
        # 1. Check authentication
        # --------------------------------------------------------

        user = get_current_user()

        if not user:
            return jsonify({
                "status": "error",
                "message": "Authentication required"
            }), 401

        # --------------------------------------------------------
        # 2. Get request data
        # --------------------------------------------------------

        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "Request body is required"
            }), 400

        # --------------------------------------------------------
        # 3. Validate required fields
        # --------------------------------------------------------

        required_fields = [
            "type",
            "title",
            "description",
            "category",
            "location",
            "date"
        ]

        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    "status": "error",
                    "message": f"{field} is required"
                }), 400

        # --------------------------------------------------------
        # 4. Validate item type
        # --------------------------------------------------------

        item_type = data["type"].upper()

        if item_type not in ["LOST", "FOUND"]:
            return jsonify({
                "status": "error",
                "message": "Type must be LOST or FOUND"
            }), 400

        # --------------------------------------------------------
        # 5. Build item data
        # --------------------------------------------------------

        item_data = {
            "user_id": user.id,
            "type": item_type,
            "title": data["title"].strip(),
            "description": data["description"].strip(),
            "category": data["category"].strip(),
            "location": data["location"].strip(),
            "date": data["date"],
            "image_url": data.get("image_url")
        }

        # --------------------------------------------------------
        # 6. Insert using server database client
        # --------------------------------------------------------

        response = (
            db
            .table("items")
            .insert(item_data)
            .execute()
        )

        # --------------------------------------------------------
        # 7. Return created item
        # --------------------------------------------------------

        return jsonify({
            "status": "success",
            "message": "Item reported successfully!",
            "item": response.data[0]
        }), 201

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ============================================================
# GET / SEARCH / FILTER ITEMS
# ============================================================

@app.route("/api/items", methods=["GET"])
def get_items():
    try:
        item_type = request.args.get("type")
        category = request.args.get("category")
        location = request.args.get("location")
        search = request.args.get("search")

        query = db.table("items").select("*")

        if item_type:
            item_type = item_type.upper()

            if item_type not in ["LOST", "FOUND"]:
                return jsonify({
                    "status": "error",
                    "message": "Type must be LOST or FOUND"
                }), 400

            query = query.eq("type", item_type)

        if category:
            query = query.ilike(
                "category",
                f"%{category}%"
            )

        if location:
            query = query.ilike(
                "location",
                f"%{location}%"
            )

        if search:
            query = query.or_(
                f"title.ilike.%{search}%,"
                f"description.ilike.%{search}%"
            )

        response = (
            query
            .order("created_at", desc=True)
            .execute()
        )

        return jsonify({
            "status": "success",
            "items": response.data
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ============================================================
# CREATE CLAIM
# ============================================================

@app.route("/api/claims", methods=["POST"])
def create_claim():
    try:
        # --------------------------------------------------------
        # 1. Check authentication
        # --------------------------------------------------------

        user = get_current_user()

        if not user:
            return jsonify({
                "status": "error",
                "message": "Authentication required"
            }), 401

        # --------------------------------------------------------
        # 2. Get request data
        # --------------------------------------------------------

        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "Request body is required"
            }), 400

        # --------------------------------------------------------
        # 3. Validate fields
        # --------------------------------------------------------

        required_fields = [
            "item_id",
            "verification_text"
        ]

        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    "status": "error",
                    "message": f"{field} is required"
                }), 400

        # --------------------------------------------------------
        # 4. Create claim
        # --------------------------------------------------------

        claim_data = {
            "item_id": data["item_id"],
            "claimant_id": user.id,
            "verification_text": data["verification_text"].strip(),
            "status": "PENDING"
        }

        response = (
            db
            .table("claims")
            .insert(claim_data)
            .execute()
        )

        return jsonify({
            "status": "success",
            "message": "Claim submitted successfully!",
            "claim": response.data[0]
        }), 201

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ============================================================
# GET CLAIMS
# ============================================================

@app.route("/api/claims", methods=["GET"])
def get_claims():
    try:
        user = get_current_user()

        if not user:
            return jsonify({
                "status": "error",
                "message": "Authentication required"
            }), 401

        response = (
            db
            .table("claims")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return jsonify({
            "status": "success",
            "claims": response.data
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ============================================================
# UPDATE CLAIM
# ============================================================

@app.route("/api/claims/<int:claim_id>", methods=["PUT"])
def update_claim(claim_id):
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "Request body is required"
            }), 400

        new_status = data.get("status", "").upper()

        if new_status not in ["APPROVED", "REJECTED"]:
            return jsonify({
                "status": "error",
                "message": "Status must be APPROVED or REJECTED"
            }), 400

        response = (
            db
            .table("claims")
            .update({
                "status": new_status
            })
            .eq("id", claim_id)
            .execute()
        )

        if not response.data:
            return jsonify({
                "status": "error",
                "message": "Claim not found"
            }), 404

        # --------------------------------------------------------
        # If claim is approved, mark item as returned
        # --------------------------------------------------------

        if new_status == "APPROVED":

            claim_item_id = response.data[0]["item_id"]

            db.table("items").update({
                "status": "RETURNED"
            }).eq(
                "id",
                claim_item_id
            ).execute()

        return jsonify({
            "status": "success",
            "message": f"Claim {new_status.lower()} successfully!",
            "claim": response.data[0]
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ============================================================
# REGISTER
# ============================================================

@app.route("/api/auth/register", methods=["POST"])
def register():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "Request body is required"
            }), 400

        email = data.get("email", "").strip()
        password = data.get("password", "").strip()

        if not email or not password:
            return jsonify({
                "status": "error",
                "message": "Email and password are required"
            }), 400

        if len(password) < 6:
            return jsonify({
                "status": "error",
                "message": "Password must be at least 6 characters"
            }), 400

        response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })

        if not response.user:
            return jsonify({
                "status": "error",
                "message": "Registration failed"
            }), 400

        return jsonify({
            "status": "success",
            "message": "Registration successful",
            "user": {
                "id": response.user.id,
                "email": response.user.email
            }
        }), 201

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ============================================================
# LOGIN
# ============================================================

@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "Request body is required"
            }), 400

        email = data.get("email", "").strip()
        password = data.get("password", "").strip()

        if not email or not password:
            return jsonify({
                "status": "error",
                "message": "Email and password are required"
            }), 400

        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if not response.user or not response.session:
            return jsonify({
                "status": "error",
                "message": "Login failed"
            }), 401

        return jsonify({
            "status": "success",
            "message": "Login successful",
            "user": {
                "id": response.user.id,
                "email": response.user.email
            },
            "access_token": response.session.access_token
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 401


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":
    app.run(
        debug=True,
        port=5000
    )