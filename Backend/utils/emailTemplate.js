export function generateVarificationEmailTemplaate(otpCode) {
  return `
    <html>
    <head>
      <style>
        .container {
          width: 100%;
          padding: 20px;
          background-color: goldenrod;
        }
        .content {
          padding: 20px;
          background-color: lightblue;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <h1>Verification Code</h1>
          <p>Your verification code is <strong>${otpCode}</strong></p>
        </div>
      </div>
    </body>

    `;
}
