import uuid
import os
from flask import Flask, jsonify, request, send_from_directory, session
from flask_cors import CORS
from functools import wraps
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename
from database import get_db_connection
from dotenv import load_dotenv
load_dotenv(override=True)
app = Flask(__name__)

app.secret_key = os.getenv("FLASK_SECRET_KEY")

if not app.secret_key:
    raise RuntimeError("FLASK_SECRET_KEY is missing from backend/.env")

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_SECURE=True,
    PERMANENT_SESSION_LIFETIME=3600
)

CORS(
    app,
    resources={
        r"/api/.*": {
            "origins": [
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "https://steve-tiles-website-backend.vercel.app"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    },
    supports_credentials=True
)


# ================= ADMIN AUTHENTICATION =================

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH")


def admin_required(function):
    @wraps(function)
    def decorated_function(*args, **kwargs):

        if not session.get("admin_logged_in"):
            return jsonify({
                "status": "error",
                "message": "Admin login required."
            }), 401

        return function(*args, **kwargs)

    return decorated_function

# ================= ADMIN AUTHENTICATION =================

@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json(silent=True) or {}

    username = data.get("username", "")
    password = data.get("password", "")

    saved_username = os.getenv("ADMIN_USERNAME", "")
    saved_password_hash = os.getenv("ADMIN_PASSWORD_HASH", "")

    print("ADMIN USER:", saved_username)
    print("HASH LOADED:", bool(saved_password_hash))

    if (
        username != saved_username
        or not saved_password_hash
        or not check_password_hash(saved_password_hash, password)
    ):
        return jsonify({
            "status": "error",
            "message": "Invalid username or password"
        }), 401

    session.clear()
    session["admin_logged_in"] = True

    return jsonify({
        "status": "success",
        "message": "Admin login successful"
    })


@app.route("/api/admin/session", methods=["GET"])
def check_admin_session():
    return jsonify({
        "authenticated": bool(session.get("admin_logged_in"))
    })


@app.route("/api/admin/logout", methods=["POST"])
def admin_logout():
    session.clear()

    return jsonify({
        "status": "success",
        "message": "Logged out successfully"
    })
# ================= IMAGE UPLOAD SETTINGS =================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "products")

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
@app.route("/uploads/products/<filename>")
def serve_product_image(filename):
    return send_from_directory(
        app.config["UPLOAD_FOLDER"],
        filename
    )
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
def allowed_file(filename):
    return (
        "." in filename and
        filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )

# GALLERY IMAGE STORAGE

GALLERY_FOLDER = os.path.join(BASE_DIR, "uploads", "gallery")
os.makedirs(GALLERY_FOLDER, exist_ok=True)

GALLERY_ALLOWED_EXTENSIONS = {
    "png", "jpg", "jpeg", "webp"
}

# ================= TILE CATALOGUE IMAGE FOLDER =================

PROJECT_FOLDER = os.path.dirname(BASE_DIR)
TILE_IMAGE_FOLDER = os.path.join(
    PROJECT_FOLDER, "images", "Tiles"
)

@app.route("/catalogue-images/<filename>")
def serve_catalogue_image(filename):
    return send_from_directory(TILE_IMAGE_FOLDER, filename)

# ================= HOME API =================

@app.route("/")
def home():
    return jsonify({
        "message": "Steve Tiles Backend is Running!",
        "status": "success"
    })


# ================= DATABASE TEST API =================

@app.route("/api/db-test")
def db_test():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT DATABASE()")
        database_name = cursor.fetchone()[0]

        return jsonify({
            "status": "success",
            "message": "MySQL connected successfully!",
            "database": database_name
        })

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# ================= PRODUCTS API =================

@app.route("/api/products")
def get_products():
    if (
        request.args.get("include_inactive") == "1"
        and not session.get("admin_logged_in")
    ):
        return jsonify({
            "status": "error",
            "message": "Admin login required."
        }), 401

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                p.id,
                p.code,
                p.name,
                p.type,
                p.size,
                p.finish,
                p.material,
                p.description,
                p.image,
                p.price,
                p.is_active,
                c.slug AS category_slug
            FROM products p
            LEFT JOIN product_categories pc
                ON p.id = pc.product_id
            LEFT JOIN categories c
                ON pc.category_id = c.id
           WHERE (%s = 1 OR p.is_active = 1)
ORDER BY p.id, c.id
""", (1 if request.args.get("include_inactive") == "1" else 0,))

        rows = cursor.fetchall()

        products = {}

        for row in rows:
            product_id = row["id"]

            if product_id not in products:
                products[product_id] = {
                    "id": row["id"],
                    "code": row["code"],
                    "name": row["name"],
                    "type": row["type"],
                    "size": row["size"],
                    "finish": row["finish"],
                    "material": row["material"],
                    "description": row["description"],
                    "image": row["image"],
                    "price": row["price"],
                    "is_active": row["is_active"],
                    "categories": []
                }

            if row["category_slug"]:
                products[product_id]["categories"].append(
                    row["category_slug"]
                )

        return jsonify({
            "status": "success",
            "products": list(products.values())
        })

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# ================= ADD PRODUCT API =================
@app.route("/api/products", methods=["POST"])
def add_product():

    connection = None
    cursor = None

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "Product details are required"
            }), 400

        name = data.get("name", "").strip()
        code = data.get("code", "").strip()
        category = data.get("category") or data.get("categories") or ""
        if isinstance(category, list):
            category = category[0] if category else ""

            category = category.strip().lower()

        if not name or not code or not category:
            return jsonify({
                "status": "error",
                "message": "Name, code and category are required"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "SELECT id FROM categories WHERE slug = %s AND is_active = 1",
            (category,)
        )

        category_row = cursor.fetchone()

        if not category_row:
            return jsonify({
                "status": "error",
                "message": "Category not found"
            }), 404

        category_id = category_row[0]

        cursor.execute("""
            INSERT INTO products
            (code, name, size, finish, price, is_active)
            VALUES (%s, %s, %s, %s, %s, 1)
        """, (
            code,
            name,
            data.get("size") or None,
            data.get("finish") or None,
            data.get("price") or None
        ))

        product_id = cursor.lastrowid

        cursor.execute("""
            INSERT INTO product_categories
            (product_id, category_id)
            VALUES (%s, %s)
        """, (product_id, category_id))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Product added successfully!",
            "product_id": product_id
        }), 201

    except Exception as error:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

# ================= PRODUCT IMAGE UPLOAD =================

@app.route("/api/products/<code>/image", methods=["POST"])
def upload_product_image(code):

    connection = None
    cursor = None

    try:
        if "image" not in request.files:
            return jsonify({
                "status": "error",
                "message": "No image selected"
            }), 400

        file = request.files["image"]

        if file.filename == "":
            return jsonify({
                "status": "error",
                "message": "Please select an image"
            }), 400

        if not allowed_file(file.filename):
            return jsonify({
                "status": "error",
                "message": "Only PNG, JPG, JPEG and WEBP images are allowed"
            }), 400

        filename = secure_filename(file.filename)
        extension = filename.rsplit(".", 1)[1].lower()

        unique_filename = f"{uuid.uuid4().hex}.{extension}"

        file.save(
            os.path.join(
                app.config["UPLOAD_FOLDER"],
                unique_filename
            )
        )

        image_path = f"uploads/products/{unique_filename}"

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "UPDATE products SET image = %s WHERE code = %s",
            (image_path, code)
        )

        if cursor.rowcount == 0:
            return jsonify({
                "status": "error",
                "message": "Product not found"
            }), 404

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Product image uploaded successfully!",
            "image": image_path
        })

    except Exception as error:
        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

# ================= DELETE PRODUCT IMAGE API =================

@app.route("/api/products/<code>/image", methods=["DELETE"])
def delete_product_image(code):

    connection = None
    cursor = None
    old_image = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "SELECT image FROM products WHERE code = %s",
            (code,)
        )

        product = cursor.fetchone()

        if not product:
            return jsonify({
                "status": "error",
                "message": "Product not found"
            }), 404

        old_image = product[0]

        if not old_image:
            return jsonify({
                "status": "error",
                "message": "This product has no image"
            }), 404

        cursor.execute(
            "UPDATE products SET image = NULL WHERE code = %s",
            (code,)
        )

        connection.commit()

        # Delete only uploaded files.
        # Never delete the original catalogue JPG files.
        if old_image.startswith("uploads/products/"):
            filename = os.path.basename(old_image)
            file_path = os.path.join(
                app.config["UPLOAD_FOLDER"],
                filename
            )

            if os.path.isfile(file_path):
                os.remove(file_path)

        return jsonify({
            "status": "success",
            "message": "Product image deleted successfully!"
        })

    except Exception as error:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

# ================= EDIT PRODUCT API =================
@app.route("/api/products/<code>", methods=["PUT"])
def edit_product(code):
    connection = None
    cursor = None

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "Product details are required"
            }), 400

        name = data.get("name", "").strip()
        category = data.get("category") or data.get("categories") or ""
        if isinstance(category, list):
            category = category[0] if category else ""

            category = category.strip().lower()

        if not name or not category:
            return jsonify({
                "status": "error",
                "message": "Name and category are required"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        # Check product
        cursor.execute(
            "SELECT id FROM products WHERE code = %s AND is_active = 1",
            (code,)
        )

        product = cursor.fetchone()

        if not product:
            return jsonify({
                "status": "error",
                "message": "Product not found"
            }), 404

        product_id = product[0]

        # Check category
        cursor.execute(
            "SELECT id FROM categories WHERE slug = %s AND is_active = 1",
            (category,)
        )

        category_row = cursor.fetchone()

        if not category_row:
            return jsonify({
                "status": "error",
                "message": "Category not found"
            }), 404

        category_id = category_row[0]

        # Update product details
        cursor.execute("""
            UPDATE products
            SET name = %s,
                size = %s,
                finish = %s,
                price = %s
            WHERE id = %s
        """, (
            name,
            data.get("size") or None,
            data.get("finish") or None,
            data.get("price") or None,
            product_id
        ))

        # Update product category
        cursor.execute(
            "DELETE FROM product_categories WHERE product_id = %s",
            (product_id,)
        )

        cursor.execute("""
            INSERT INTO product_categories
            (product_id, category_id)
            VALUES (%s, %s)
        """, (product_id, category_id))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Product updated successfully!"
        })

    except Exception as error:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

# ================= DELETE PRODUCT API =================

@app.route("/api/products/<code>", methods=["DELETE"])
def delete_product(code):

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Check whether the product exists and is active
        cursor.execute(
            "SELECT id FROM products WHERE code = %s AND is_active = 1",
            (code,)
        )

        product = cursor.fetchone()

        if not product:
            return jsonify({
                "status": "error",
                "message": "Product not found or already deleted"
            }), 404

        # Soft delete: deactivate the product
        cursor.execute(
            "UPDATE products SET is_active = 0 WHERE code = %s",
            (code,)
        )

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Product deleted successfully!"
        })

    except Exception as error:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# ================= ACTIVATE PRODUCT API =================

@app.route("/api/products/<code>/activate", methods=["PUT"])
def activate_product(code):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            UPDATE products
            SET is_active = 1
            WHERE code = %s AND is_active = 0
        """, (code,))

        if cursor.rowcount == 0:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Product not found or already active"
            }), 404

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Product activated successfully!"
        })

    except Exception as error:
        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# ================= CATEGORIES API =================

@app.route("/api/categories", methods=["GET"])
def get_categories():
    if (
        request.args.get("include_inactive") == "1"
        and not session.get("admin_logged_in")
    ):
        return jsonify({
            "status": "error",
            "message": "Admin login required."
        }), 401
    connection = None
    cursor = None

    try:
        include_inactive = request.args.get("include_inactive") == "1"

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        if include_inactive:
            cursor.execute("""
                SELECT id, name, slug, description, is_active
                FROM categories
                ORDER BY id
            """)
        else:
            cursor.execute("""
                SELECT id, name, slug, description, is_active
                FROM categories
                WHERE is_active = 1
                ORDER BY id
            """)

        rows = cursor.fetchall()

        return jsonify({
            "status": "success",
            "categories": rows
        })

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# ================= ADD CATEGORY API =================

@app.route("/api/categories", methods=["POST"])
def add_category():
    connection = None
    cursor = None

    try:
        data = request.get_json() or {}

        name = data.get("name", "").strip()
        slug = data.get("slug", "").strip().lower()
        description = data.get("description", "").strip()

        if not name or not slug:
            return jsonify({
                "status": "error",
                "message": "Category name and slug are required"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO categories (name, slug, description, is_active)
            VALUES (%s, %s, %s, 1)
        """, (name, slug, description or None))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Category added successfully!",
            "category_id": cursor.lastrowid
        }), 201

    except Exception as error:
        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# ================= EDIT CATEGORY API =================

@app.route("/api/categories/<int:category_id>", methods=["PUT"])
def edit_category(category_id):
    connection = None
    cursor = None

    try:
        data = request.get_json() or {}

        name = data.get("name", "").strip()
        description = data.get("description", "").strip()

        if not name:
            return jsonify({
                "status": "error",
                "message": "Category name is required"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            UPDATE categories
            SET name = %s, description = %s
            WHERE id = %s
        """, (name, description or None, category_id))

        if cursor.rowcount == 0:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Category not found or no changes made"
            }), 404

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Category updated successfully!"
        })

    except Exception as error:
        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# ================= DEACTIVATE CATEGORY API =================

@app.route("/api/categories/<int:category_id>", methods=["DELETE"])
def deactivate_category(category_id):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            UPDATE categories
            SET is_active = 0
            WHERE id = %s AND is_active = 1
        """, (category_id,))

        if cursor.rowcount == 0:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Category not found or already inactive"
            }), 404

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Category deactivated successfully!"
        })

    except Exception as error:
        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# ================= ACTIVATE CATEGORY API =================

@app.route("/api/categories/<int:category_id>/activate", methods=["PUT"])
def activate_category(category_id):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            UPDATE categories
            SET is_active = 1
            WHERE id = %s AND is_active = 0
        """, (category_id,))

        if cursor.rowcount == 0:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Category not found or already active"
            }), 404

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Category activated successfully!"
        })

    except Exception as error:
        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# ================= WEBSITE GENERAL SETTINGS API =================

@app.route("/api/settings/general", methods=["GET"])
def get_general_settings():

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, website_name, tagline,
                   description, website_status
            FROM website_settings
            ORDER BY id
            LIMIT 1
        """)

        settings = cursor.fetchone()

        if not settings:
            settings = {
                "website_name": "Steve Tiles",
                "tagline": "Your Trusted Tile Destination",
                "description": "Explore quality tiles for your spaces.",
                "website_status": "active"
            }

        return jsonify({
            "status": "success",
            "settings": settings
        })

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/api/settings/general", methods=["PUT"])
def save_general_settings():

    connection = None
    cursor = None

    try:
        data = request.get_json() or {}

        website_name = data.get("website_name", "").strip()
        tagline = data.get("tagline", "").strip()
        description = data.get("description", "").strip()
        website_status = data.get("website_status", "active")

        if not website_name:
            return jsonify({
                "status": "error",
                "message": "Website name is required"
            }), 400

        if website_status not in ["active", "maintenance"]:
            return jsonify({
                "status": "error",
                "message": "Invalid website status"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "SELECT id FROM website_settings ORDER BY id LIMIT 1"
        )

        existing = cursor.fetchone()

        if existing:
            cursor.execute("""
                UPDATE website_settings
                SET website_name = %s,
                    tagline = %s,
                    description = %s,
                    website_status = %s
                WHERE id = %s
            """, (
                website_name,
                tagline or None,
                description or None,
                website_status,
                existing[0]
            ))

        else:
            cursor.execute("""
                INSERT INTO website_settings
                (website_name, tagline, description, website_status)
                VALUES (%s, %s, %s, %s)
            """, (
                website_name,
                tagline or None,
                description or None,
                website_status
            ))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "General settings saved successfully!"
        })

    except Exception as error:
        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# ================= EXTENDED WEBSITE SETTINGS API =================

@app.route("/api/settings/extra", methods=["GET"])
def get_extra_settings():

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT *
            FROM website_extra_settings
            WHERE id = 1
        """)

        settings = cursor.fetchone()

        if not settings:
            return jsonify({
                "status": "success",
                "settings": {}
            })

        return jsonify({
            "status": "success",
            "settings": settings
        })

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/api/settings/extra", methods=["PUT"])
def save_extra_settings():

    connection = None
    cursor = None

    try:
        data = request.get_json() or {}

        # Dashboard field names mapped to MySQL columns
        field_map = {
            "settingPhone": "phone",
            "settingEmail": "email",
            "settingWhatsapp": "whatsapp",
            "settingAddress": "address",
            "settingLogoUrl": "logo_url",
            "settingFaviconUrl": "favicon_url",
            "settingPrimaryColor": "primary_color",
            "settingSecondaryColor": "secondary_color",
            "settingHomeTitle": "home_title",
            "settingHomeSubtitle": "home_subtitle",
            "settingHomeBanner": "home_banner_url",
            "settingHomeDescription": "home_description",
            "settingOpeningTime": "opening_time",
            "settingClosingTime": "closing_time",
            "settingWorkingDays": "working_days",
            "settingHolidayNote": "holiday_note",
            "settingInstagram": "instagram_url",
            "settingFacebook": "facebook_url",
            "settingYoutube": "youtube_url",
            "settingOtherSocial": "other_social_url"
        }

        allowed_columns = list(field_map.values())

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT id FROM website_extra_settings WHERE id = 1
        """)

        existing = cursor.fetchone()

        if not existing:
            cursor.execute("""
                INSERT INTO website_extra_settings (id)
                VALUES (1)
            """)

        # Update only the fields submitted by the dashboard
        updates = []

        for input_name, column_name in field_map.items():

            if input_name in data:
                updates.append((
                    column_name,
                    data[input_name]
                ))

        if updates:
            set_clause = ", ".join(
                f"{column} = %s" for column, value in updates
            )

            values = [value for column, value in updates]
            values.append(1)

            cursor.execute(
                f"""
                UPDATE website_extra_settings
                SET {set_clause}
                WHERE id = %s
                """,
                tuple(values)
            )

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Website settings saved successfully!"
        })

    except Exception as error:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
# ================= SYNC 25 TILE CATALOGUE =================

@app.route("/api/catalogue/sync", methods=["POST"])
def sync_tile_catalogue():

    catalogue = [
        ("ST001", "Botein Mink Marble Wall", "wall"),
        ("ST002", "Les Bijoux Beige Floor", "floor"),
        ("ST003", "Taj Mahal Grey Floor", "floor"),
        ("ST004", "Opal Yamuna Floor", "floor"),
        ("ST005", "Amico Light Floor", "floor"),
        ("ST006", "Avalon White Floor", "floor"),
        ("ST007", "Liquorice Dark Grey Outdoor", "outdoor"),
        ("ST008", "Blue Lagoon Wall", "wall"),
        ("ST009", "Blanc Calacatta Floor", "floor"),
        ("ST010", "Ergon Dark Grey Outdoor", "outdoor"),
        ("ST011", "Marza Aqua Wall", "wall"),
        ("ST012", "Nilo Decorative Wall", "wall"),
        ("ST013", "Premium White Marble Floor", "floor"),
        ("ST014", "Premium Beige Marble Floor", "floor"),
        ("ST015", "Wooden Oak Floor", "floor"),
        ("ST016", "Premium Beige Marble Large Floor", "floor"),
        ("ST017", "Walnut Wood Floor", "floor"),
        ("ST018", "Emerald Zellige Kitchen", "kitchen"),
        ("ST019", "Navy Subway Kitchen", "kitchen"),
        ("ST020", "Sage Green Decorative Bathroom", "bathroom"),
        ("ST021", "White Fluted Decor Wall", "wall"),
        ("ST022", "Terrazzo White Floor", "floor"),
        ("ST023", "Black Granite Floor", "floor"),
        ("ST024", "Ivory Limestone Outdoor", "outdoor"),
        ("ST025", "Beige Sandstone Outdoor", "outdoor")
    ]

    connection = None
    cursor = None

    try:
        # Check that all 25 images exist first
        missing_images = []

        for code, name, category in catalogue:
            image_file = os.path.join(
                TILE_IMAGE_FOLDER, f"{code}.jpg"
            )

            if not os.path.isfile(image_file):
                missing_images.append(f"{code}.jpg")

        if missing_images:
            return jsonify({
                "status": "error",
                "message": "Some catalogue images are missing",
                "missing_images": missing_images
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        added = 0
        updated = 0

        for code, name, category_slug in catalogue:

            image_path = f"catalogue-images/{code}.jpg"

            cursor.execute(
                "SELECT id FROM categories WHERE slug = %s AND is_active = 1",
                (category_slug,)
            )

            category_row = cursor.fetchone()

            if not category_row:
                raise Exception(
                    f"Category not found: {category_slug}"
                )

            category_id = category_row[0]

            cursor.execute(
                "SELECT id FROM products WHERE code = %s",
                (code,)
            )

            existing = cursor.fetchone()

            if existing:
                product_id = existing[0]

                cursor.execute("""
                    UPDATE products
                    SET name = %s, image = %s
                    WHERE id = %s
                """, (name, image_path, product_id))

                updated += 1

            else:
                cursor.execute("""
                    INSERT INTO products
                    (code, name, image, is_active)
                    VALUES (%s, %s, %s, 1)
                """, (code, name, image_path))

                product_id = cursor.lastrowid
                added += 1

            # Set the correct catalogue category
            cursor.execute("""
                DELETE FROM product_categories
                WHERE product_id = %s
            """, (product_id,))

            cursor.execute("""
                INSERT INTO product_categories
                (product_id, category_id)
                VALUES (%s, %s)
            """, (product_id, category_id))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "25-product catalogue synced successfully!",
            "total_products": 25,
            "added": added,
            "updated": updated
        })

    except Exception as error:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# ==========================================
# STEVE TILES GALLERY API
# ==========================================

def ensure_gallery_table(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS gallery (
            id INT AUTO_INCREMENT PRIMARY KEY,
            image VARCHAR(500) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)


@app.route("/api/gallery", methods=["GET"])
def get_gallery():

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        ensure_gallery_table(cursor)
        connection.commit()

        cursor.execute("""
            SELECT id, image, created_at
            FROM gallery
            ORDER BY id DESC
        """)

        images = cursor.fetchall()

        for item in images:
            item["image"] = (
                "http://127.0.0.1:5000/"
                + item["image"].lstrip("/")
            )

            if item["created_at"]:
                item["created_at"] = str(item["created_at"])

        return jsonify({
            "status": "success",
            "images": images
        })

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


@app.route("/api/gallery", methods=["POST"])
@admin_required
def upload_gallery():

    connection = None
    cursor = None
    saved_files = []

    try:
        files = request.files.getlist("images")

        valid_files = [
            file for file in files if file and file.filename
        ]

        if not valid_files:
            return jsonify({
                "status": "error",
                "message": "Please select images first."
            }), 400

        for file in valid_files:
            if not allowed_file(file.filename):
                return jsonify({
                    "status": "error",
                    "message": "Only PNG, JPG, JPEG and WEBP images are allowed."
                }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        ensure_gallery_table(cursor)

        for file in valid_files:

            original_name = secure_filename(file.filename)
            extension = original_name.rsplit(".", 1)[1].lower()

            unique_filename = (
                f"{uuid.uuid4().hex}.{extension}"
            )

            file_path = os.path.join(
                GALLERY_FOLDER,
                unique_filename
            )

            file.save(file_path)
            saved_files.append(file_path)

            image_path = (
                f"uploads/gallery/{unique_filename}"
            )

            cursor.execute("""
                INSERT INTO gallery (image)
                VALUES (%s)
            """, (image_path,))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": (
                f"{len(saved_files)} gallery image(s) "
                "uploaded successfully."
            )
        }), 201

    except Exception as error:

        if connection:
            connection.rollback()

        for file_path in saved_files:
            if os.path.isfile(file_path):
                os.remove(file_path)

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


@app.route("/api/gallery/<int:image_id>", methods=["DELETE"])
@admin_required
def delete_gallery_image(image_id):

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        ensure_gallery_table(cursor)

        cursor.execute("""
            SELECT image
            FROM gallery
            WHERE id = %s
        """, (image_id,))

        image_record = cursor.fetchone()

        if not image_record:
            return jsonify({
                "status": "error",
                "message": "Gallery image not found."
            }), 404

        image_path = image_record["image"]

        cursor.execute("""
            DELETE FROM gallery
            WHERE id = %s
        """, (image_id,))

        connection.commit()

        filename = os.path.basename(image_path)

        physical_path = os.path.join(
            GALLERY_FOLDER,
            filename
        )

        if os.path.isfile(physical_path):
            os.remove(physical_path)

        return jsonify({
            "status": "success",
            "message": "Gallery image deleted successfully."
        })

    except Exception as error:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


@app.route("/uploads/gallery/<filename>")
def serve_gallery_image(filename):

    return send_from_directory(
        GALLERY_FOLDER,
        filename
    )


# ================= CUSTOMER ENQUIRY API =================

@app.route("/api/enquiries", methods=["POST"])
def save_enquiry():

    connection = None
    cursor = None

    try:
        data = request.get_json() or {}

        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        phone = data.get("phone", "").strip()
        category = data.get("category", "").strip()
        message = data.get("message", "").strip()

        if not name or not email or not phone or not category or not message:
            return jsonify({
                "status": "error",
                "message": "Please complete all the fields."
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO enquiries
            (name, email, phone, category, message, status)
            VALUES (%s, %s, %s, %s, %s, 'New')
        """, (name, email, phone, category, message))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Enquiry submitted successfully!"
        }), 201

    except Exception as error:
        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

# ================= START FLASK SERVER =================

if __name__ == "__main__":
    app.run(debug=True, port=5000)
