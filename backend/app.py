from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)
from flask_cors import CORS

from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)

from flask_migrate import Migrate
from datetime import timedelta

app = Flask(__name__)
CORS(app)
app.config["JWT_SECRET_KEY"] = "my_super_secret_key"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=30)

db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# ==========================
# User Model
# ==========================
class User(db.Model):

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(100),
        nullable=False,
        unique=True
    )

    password = db.Column(
        db.String(255),
        nullable=False
    )

    role = db.Column(
        db.String(20),
        nullable=False,
        default="User"
    )

    def __repr__(self):
        return f"<User {self.name}>"


# ==========================
# Task Model
# ==========================
class Task(db.Model):

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    title = db.Column(
        db.String(200),
        nullable=False
    )

    description = db.Column(
        db.String(500),
        nullable=False
    )

    status = db.Column(
        db.String(50),
        default="Pending"
    )

    due_date = db.Column(
        db.String(50)
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False
    )

# ==========================
# Expense Model
# ==========================
class Expense(db.Model):

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    title = db.Column(
        db.String(100),
        nullable=False
    )

    amount = db.Column(
        db.Float,
        nullable=False
    )

    category = db.Column(
        db.String(100),
        nullable=False
    )

    date = db.Column(
        db.String(50),
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False
    )


# ==========================
# Home Route
# ==========================
@app.route("/")
def home():
    return "Hello Ajay"


# ==========================
# Register User
# ==========================
@app.route("/register", methods=["POST"])
def register():

    data = request.json

    if "name" not in data:
        return jsonify({
            "error": "Name is required"
        }), 400

    if "email" not in data:
        return jsonify({
            "error": "Email is required"
        }), 400

    if "password" not in data:
        return jsonify({
            "error": "Password is required"
        }), 400

    existing_user = User.query.filter_by(
        email=data["email"]
    ).first()

    if existing_user:
        return jsonify({
            "error": "Email already exists"
        }), 400

    hashed_password = generate_password_hash(
        data["password"]
    )

    user = User(
        name=data["name"],
        email=data["email"],
        password=hashed_password,
        role="User"
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully"
    }), 201


# ==========================
# Get All Users
# ==========================
@app.route("/users")
def get_users():

    users = User.query.all()

    result = []

    for user in users:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        })

    return jsonify(result)


# ==========================
# Get Single User
# ==========================

@app.route("/user/<int:user_id>", methods=["GET"])
def get_user(user_id):

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    })


# ==========================
# Update User
# ==========================

@app.route("/user/<int:user_id>", methods=["PUT"])
def update_user(user_id):

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    data = request.json

    user.name = data["name"]
    user.email = data["email"]

    db.session.commit()

    return jsonify({
        "message": "User updated successfully"
    })

# ==========================
# User Login
# ==========================
@app.route("/login", methods=["POST"])
def login():

    data = request.json

    if "email" not in data:
        return jsonify({
            "error":"Email is required"
        }),400

    if "password" not in data:
        return jsonify({
            "error":"Password is required"
        }),400

    user = User.query.filter_by(
        email=data["email"]
    ).first()

    if not user:
        return jsonify({
            "error":"Invalid email or password"
        }),401

    password_match = check_password_hash(
        user.password,
        data["password"]
    )

    if not password_match:
        return jsonify({
            "error":"Invalid email or password"
        }),401
    
    token = create_access_token(
    identity=str(user.id)
    )

    return jsonify({
    "message": "Login successful",
    "user": user.name,
    "role": user.role,
    "token": token
})

# ==========================
# User Profile
# ==========================
@app.route("/profile", methods=["GET"])
@jwt_required()
def profile():

    current_user_id = get_jwt_identity()

    user = User.query.get(
        int(current_user_id)
    )

    return jsonify({
        "message": "Profile Access Granted",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    })

# ==========================
# Delete User
# ==========================
@app.route("/user/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({
        "message": "User deleted successfully"
    })


# ==========================
# All members and their roles
# ==========================
@app.route("/staff")
@jwt_required()
def admin_users():

    current_user_id = get_jwt_identity()

    user = User.query.get(
        int(current_user_id)
    )

    if user.role != "Admin":

        return jsonify({
            "error": "Access Denied"
        }), 403

    users = User.query.all()

    result = []

    for u in users:

        result.append({
            "id": u.id,
            "name": u.name,
            "role": u.role
        })

    return jsonify(result)


# ==========================
# Make Admin
# ==========================
@app.route("/make-admin/<int:user_id>")
def make_admin(user_id):

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    user.role = "Admin"

    db.session.commit()

    return jsonify({
        "message": f"{user.name} is now Admin"
    })


# ==========================
# Admin Dashboard
# ==========================
@app.route("/admin/dashboard", methods=["GET"])
@jwt_required()
def admin_dashboard():

    current_user_id = get_jwt_identity()

    user = User.query.get(
        int(current_user_id)
    )

    if user.role != "Admin":
        return jsonify({
            "message": "Access Denied"
        }), 403

    total_users = User.query.count()

    total_tasks = Task.query.count()

    total_expenses = Expense.query.count()

    total_expense_amount = db.session.query(
        db.func.sum(Expense.amount)
    ).scalar() or 0

    return jsonify({
        "total_users": total_users,
        "total_tasks": total_tasks,
        "total_expenses": total_expenses,
        "total_expense_amount": total_expense_amount
    })


# ==========================
# Create Task
# ==========================
@app.route("/tasks", methods=["POST"])
@jwt_required()
def create_task():

    data = request.get_json()

    current_user_id = get_jwt_identity()

    new_task = Task(
        title=data["title"],
        description=data["description"],
        due_date=data["due_date"],
        user_id=int(current_user_id)
    )

    db.session.add(new_task)

    db.session.commit()

    return jsonify({
        "message": "Task Created Successfully"
    }), 201

# ==========================
# Update Task
# ==========================
@app.route("/tasks/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):

    data = request.get_json()

    current_user_id = get_jwt_identity()

    user = User.query.get(
        int(current_user_id)
    )

    task = Task.query.get(task_id)

    if not task:
        return jsonify({
            "message": "Task not found"
        }), 404

    if (
        user.role != "Admin"
        and task.user_id != int(current_user_id)
    ):
        return jsonify({
            "message": "Access Denied"
        }), 403

    task.status = data["status"]

    db.session.commit()

    return jsonify({
        "message": "Task Updated Successfully"
    })


# ==========================
# View Tasks
# ==========================
@app.route("/tasks", methods=["GET"])
@jwt_required()
def get_tasks():

    current_user_id = get_jwt_identity()

    user = User.query.get(
        int(current_user_id)
    )

    if user.role == "Admin":

        tasks = Task.query.all()

    else:

        tasks = Task.query.filter_by(
            user_id=int(current_user_id)
        ).all()

    result = []

    for task in tasks:

        result.append({
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "due_date": task.due_date,
            "user_id": task.user_id
        })

    return jsonify(result)


# ==========================
# Delete Tasks
# ==========================
@app.route("/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):

    current_user_id = get_jwt_identity()

    user = User.query.get(
        int(current_user_id)
    )

    task = Task.query.get(task_id)

    if not task:
        return jsonify({
            "message": "Task not found"
        }), 404

    if (
        user.role != "Admin"
        and task.user_id != int(current_user_id)
    ):
        return jsonify({
            "message": "Access Denied"
        }), 403

    db.session.delete(task)

    db.session.commit()

    return jsonify({
        "message": "Task Deleted Successfully"
    })


# ==========================
# Create Expenses
# ==========================
@app.route("/expenses", methods=["POST"])
@jwt_required()
def create_expense():

    data = request.get_json()

    current_user_id = get_jwt_identity()

    expense = Expense(
        title=data["title"],
        amount=data["amount"],
        category=data["category"],
        date=data["date"],
        user_id=int(current_user_id)
    )

    db.session.add(expense)
    db.session.commit()

    return jsonify({
        "message": "Expense Created Successfully"
    }), 201


# ==========================
# View Expenses
# ==========================
@app.route("/expenses", methods=["GET"])
@jwt_required()
def get_expenses():

    current_user_id = get_jwt_identity()

    user = User.query.get(
        int(current_user_id)
    )

    if user.role == "Admin":
        expenses = Expense.query.all()

    else:
        expenses = Expense.query.filter_by(
            user_id=int(current_user_id)
        ).all()

    result = []

    for expense in expenses:

        result.append({
            "id": expense.id,
            "title": expense.title,
            "amount": expense.amount,
            "category": expense.category,
            "date": expense.date,
            "user_id": expense.user_id
        })

    return jsonify(result)


# ==========================
# Edit Expenses
# ==========================
@app.route("/expenses/<int:expense_id>", methods=["PUT"])
@jwt_required()
def update_expense(expense_id):

    data = request.get_json()

    current_user_id = get_jwt_identity()

    user = User.query.get(
        int(current_user_id)
    )

    expense = Expense.query.get(expense_id)

    if not expense:
        return jsonify({
            "message": "Expense not found"
        }), 404

    if (
        user.role != "Admin"
        and expense.user_id != int(current_user_id)
    ):
        return jsonify({
            "message": "Access Denied"
        }), 403

    expense.title = data["title"]
    expense.amount = data["amount"]
    expense.category = data["category"]
    expense.date = data["date"]

    db.session.commit()

    return jsonify({
        "message": "Expense Updated Successfully"
    })


# ==========================
# Delete Expenses
# ==========================
@app.route("/expenses/<int:expense_id>", methods=["DELETE"])
@jwt_required()
def delete_expense(expense_id):

    current_user_id = get_jwt_identity()

    user = User.query.get(
        int(current_user_id)
    )

    expense = Expense.query.get(expense_id)

    if not expense:
        return jsonify({
            "message": "Expense not found"
        }), 404

    if (
        user.role != "Admin"
        and expense.user_id != int(current_user_id)
    ):
        return jsonify({
            "message": "Access Denied"
        }), 403

    db.session.delete(expense)

    db.session.commit()

    return jsonify({
        "message": "Expense Deleted Successfully"
    })


# ==========================
# Dashboard
# ==========================
@app.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():

    current_user_id = get_jwt_identity()

    user = User.query.get(
        int(current_user_id)
    )

    if user.role == "Admin":

        total_tasks = Task.query.count()

        completed_tasks = Task.query.filter_by(
            status="Completed"
        ).count()

        pending_tasks = Task.query.filter_by(
            status="Pending"
        ).count()

        total_expenses = db.session.query(
            db.func.sum(
                Expense.amount
            )
        ).scalar() or 0

    else:

        total_tasks = Task.query.filter_by(
            user_id=user.id
        ).count()

        completed_tasks = Task.query.filter_by(
            user_id=user.id,
            status="Completed"
        ).count()

        pending_tasks = Task.query.filter_by(
            user_id=user.id,
            status="Pending"
        ).count()

        total_expenses = db.session.query(
            db.func.sum(
                Expense.amount
            )
        ).filter(
            Expense.user_id == user.id
        ).scalar() or 0

    return jsonify({

        "total_tasks": total_tasks,

        "completed_tasks": completed_tasks,

        "pending_tasks": pending_tasks,

        "total_expenses": total_expenses

    })


# ==========================
# Create Tables
# ==========================
# with app.app_context():   
#     db.create_all()
#Above two lines removed beacuse of migration


# ==========================
# Run App
# ==========================
if __name__ == "__main__":
    app.run(debug=True)