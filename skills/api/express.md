# Express.js API 模式

## 路由实现

```typescript
// routes/users.ts
import { Router } from "express";
import { body, query, validationResult } from "express-validator";

const router = Router();

router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("pageSize").optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", details: errors.array() },
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;

      const [users, total] = await Promise.all([
        User.find()
          .skip((page - 1) * pageSize)
          .limit(pageSize),
        User.countDocuments(),
      ]);

      res.json({
        success: true,
        data: users,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/",
  [body("name").notEmpty().isLength({ max: 100 }), body("email").isEmail()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", details: errors.array() },
        });
      }

      const user = await User.create(req.body);
      res.status(201).json({ success: true, data: user, message: "创建成功" });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
```
