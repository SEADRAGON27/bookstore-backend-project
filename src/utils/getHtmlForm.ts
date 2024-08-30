export function getHtmlForm(signature: string, data: string) {
  const formHtml = `
    <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>LiqPay Payment</title>
          <style>
              body {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
              }
              .container {
                  text-align: center;
                  background: white;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              button {
                  padding: 10px 20px;
                  border: none;
                  border-radius: 5px;
                  background-color: #4CAF50;
                  color: white;
                  cursor: pointer;
                  font-size: 16px;
              }
              button:hover {
                  background-color: #45a049;
              }
          </style>
          </head>
      <body>
          <form id="liqpayForm" method="POST" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8">
              <input type="hidden" name="data" value="${data}">
              <input type="hidden" name="signature" value="${signature}">
              <input type="image" src="//static.liqpay.ua/buttons/payUk.png" alt="Pay with LiqPay">
          </form>
      </body>
      </html>`;

  return formHtml;
}
