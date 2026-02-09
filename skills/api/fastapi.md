# FastAPI API 模式

## 路由实现

```python
# routers/users.py
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/v1/users", tags=["users"])

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    age: int | None = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str

@router.get("")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    skip = (page - 1) * page_size
    users = await db.users.find().skip(skip).limit(page_size).to_list()
    total = await db.users.count_documents({})

    return {
        "success": True,
        "data": users,
        "pagination": {
            "page": page,
            "pageSize": page_size,
            "total": total,
            "totalPages": (total + page_size - 1) // page_size
        }
    }

@router.post("", status_code=201)
async def create_user(user: UserCreate):
    result = await db.users.insert_one(user.dict())
    created = await db.users.find_one({"_id": result.inserted_id})

    return {
        "success": True,
        "data": created,
        "message": "创建成功"
    }

@router.get("/{user_id}")
async def get_user(user_id: str):
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="用户未找到")

    return {"success": True, "data": user}
```
