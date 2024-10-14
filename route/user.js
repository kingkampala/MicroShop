const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {register, login, reset, update, remove, get, getId} = require('../controller/user');
const { getCache, setCache, deleteCache } = require('../cache/service');

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           examples:
 *             example1:
 *               summary: A successful user registration
 *               value: {
 *                 "name": "unique_name",
 *                 "username": "unique_username",
 *                 "email": "unique_email@example.com",
 *                 "password": "YourSecurePassword123!",
 *                 "confirmPassword": "YourSecurePassword123!"
 *               }
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *       400:
 *         description: Invalid input data or email/username already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email or Username already exists"
 */
router.post('/register', register);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               loginIdentifier:
 *                 type: string
 *                 description: "User's email or username"
 *                 example: "johndoe@gmail.com"
 *               password:
 *                 type: string
 *                 description: "User's password"
 *                 example: "JohnDoe@10!"
 *           required:
 *             - loginIdentifier
 *             - password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated access
 *               example:
 *                 {
 *                   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
 *                 }
 *       401:
 *         description: Unauthorized (Invalid credentials)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid email/username or password"
 */
router.post('/login', login);

/**
 * @swagger
 * /user/{id}/reset:
 *   patch:
 *     summary: Reset user password
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           example: "26de1317-3773-4bf9-9bd0-fd81be98cc8b"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: "password"
 *                 example: "YourSecurePassword123!"
 *               newPassword:
 *                 type: string
 *                 description: "new password"
 *                 example: "YourNewSecurePassword@123!"
 *               confirmPassword:
 *                 type: string
 *                 description: "confirm new password"
 *                 example: "YourNewSecurePassword@123!"
 *           required:
 *             - password
 *             - newPassword
 *             - confirmPassword
 *     responses:
*       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/reset', authenticateToken, reset);

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const cachedUsers = await getCache('users');
        if (cachedUsers) {
          return res.json(cachedUsers);
        }
        const users = await get(req, res, next);
        await setCache('users', users);
        res.json(users);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [User]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "26de1317-3773-4bf9-9bd0-fd81be98cc8b"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        const cachedUser = await getCache(`user:${id}`);
        if (cachedUser) {
        return res.json(cachedUser);
        }
        const user = await getId(req, res, next);
        await setCache(`user:${id}`, user);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Update user details by ID
 *     tags: [User]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "26de1317-3773-4bf9-9bd0-fd81be98cc8b"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username or email:
 *                 type: string
 *                 description: "new username or new email to be updated"
 *                 example: "unique_username or unique_email@example.com"
 *           required:
 *             - username or email
 *     responses:
 *       200:
 *         description: User details successfully updated
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authenticateToken, update);

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [User]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "26de1317-3773-4bf9-9bd0-fd81be98cc8b"
 *     responses:
 *       200:
 *         description: User successfully deleted
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticateToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        await deleteCache(`user:${id}`);
        await deleteCache('users');
        await remove(req, res, next);
    } catch (error) {
        next(error);
    }
});

module.exports = router;