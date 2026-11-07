
from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_db_connection

app = Flask(__name__)
CORS(app)


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
            WHERE p.is_active = 1
            ORDER BY p.id, c.id
        """)

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
        category = data.get("category", "").strip().lower()

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
# ================= START FLASK SERVER =================

if __name__ == "__main__":
    app.run(debug=True, port=5000)
