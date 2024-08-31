import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_KEY || "secret_key";
const TOKEN_EXPIRY = "3d";

const createToken = (userId ,email ) => {
  return jwt.sign(
    { userId,email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      avatar,
    });

    const newUser = await user.save();
    const token = createToken(newUser._id ,newUser.email );
    res.cookie("jwt", token, {
      TOKEN_EXPIRY,
      secure: true,
      sameSite: "None",
    });
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        id: newUser._id,
      },
      token: token,
    });
  } catch (error) {
    console.log(`Error registering user: ${error.message}`);
    return res
      .status(500)
      .json({ err: `Error registering user: ${error.message}` });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ err: "User not found" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ err: "Invalid password" });
    }
    const token = createToken( user._id ,user.email);
    res.cookie("jwt", token, {
      TOKEN_EXPIRY,
      secure: true,
      sameSite: "None",
    });
    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        id: user._id,
      },
      token: token,
    });
  } catch (error) {
    console.log(`Error logging in user: ${error.message}`);
    return res
      .status(500)
      .json({ err: `Error logging in user: ${error.message}` });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("jwt");
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log(`Error logging out user: ${error.message}`);
    return res
      .status(500)
      .json({ err: `Error logging out user: ${error.message}` });
  }
};
