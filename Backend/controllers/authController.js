import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import { sendVarificationCode } from "../utils/sendVarificationCode.js";
import { sendToken } from "../utils/sendToken.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }

    const isRegistered = await User.findOne({ email, accountVerified: true });
    if (isRegistered) {
      return next(new ErrorHandler("User already registered", 400));
    }
    const registerationAttemptByUser = await User.findOne({
      email,
      accountVerified: false,
    });

    // if (registerationAttemptByUser.length > 5) {
    //   return next(
    //     new ErrorHandler("You have reached the maximum number of attempts", 400)
    //   );
    // }

    if (password.length < 8 || password.length > 16) {
      return next(
        new ErrorHandler(
          "Password must be at least 8 characters long then 16 characters",
          400
        )
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const verificationCode = await user.generateVerificationCode();
    await user.save();
    sendVarificationCode(verificationCode, email, res);

    res.status(200).json({
      success: true,
      message: "Register User",
    });
  } catch (error) {
    next(error);
  }
});

export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }

  try {
    const userAllEntreis = await User.findOne({
      email,
      accountVerified: false,
    }).sort({ createdAt: -1 });

    if (!userAllEntreis) {
      return next(new ErrorHandler("Usernot found", 404));
    }
    let user;
    if (userAllEntreis.length > 1) {
      user = userAllEntreis[0];
      await User.deleteMany({
        _id: { $ne: user._id },
        email,
        accountVerified: false,
      });
    } else {
      user = userAllEntreis[0];
    }

    if (user.verificationCode !== Number(otp)) {
      return next(new ErrorHandler("Invalid OTP", 400));
    }
    const currentTime = Date.now();

    const verificationCodeExpire = new Date(
      user.varificationCodeExpires
    ).getTime();

    if (currentTime > verificationCodeExpire) {
      return next(new ErrorHandler("OTP has expired", 400));
    }
    user.accountVerified = true;
    (user.verifcationCode = null),
      (user.varificationCodeExpires = null),
      await user.save({ validateModifiedOnly: true });
    sendToken(user, 200, "Account Verified", res);
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }

  const user = await User.findOne({email, accountVerified: true}).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid  Password", 401));
  }
  sendToken(user, 200, "Login Successful", res);

});