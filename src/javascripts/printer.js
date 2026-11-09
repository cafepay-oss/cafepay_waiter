import store from '../store'

function sixCMPrinter(data, table) {
  let string = ''
  string = fillHeader('SIX', string)
  string = fillBody('SIX', string, data, table)
  return string
}

function eightCMPrinter(data, table) {
  let string = ''
  string = fillHeader('EIGHT', string)
  string = fillBody('EIGHT', string, data, table)
  return string
}

function fillHeader(type, string) {
  if (type == 'SIX') {
    return (string + `<!DOCTYPE html>
    <html>
    <head>
    <title>print</title>
    <meta charset="UTF-8">
    <style>
                table {
                  width: 100%
                }
                td, th {
                    border: 1px solid black;
                    padding: 2px;
                    text-align: center;
                }
                td:first-child ,th:first-child {
                    border-color: black;
                    border-style: solid;
                    border-width: 1px 0px 1px 0px;
                    text-align: right;
                }
                td:last-child ,th:last-child {
                    border-color: black;
                    border-style: solid;
                    border-width: 1px 0px 1px 0px;
                }
                @page {
                    margin: 0;
                    padding: 0;
                }
                body {
                    font-family: Tahoma;
                    font-size: 14px;
                    border: 1.5px solid black;
                    margin: 0;
                    padding: 0;
                }
            </style>
        </head>`)
  } else if (type == 'EIGHT') { 
  return (string + `<!DOCTYPE html>
  <html>
      <head>
          <title>print</title>
          <meta charset="UTF-8">
          <style>
              table {
                width: 100%
              }
              td, th {
                  border: 1px solid black;
                  padding: 2px;
                  text-align: center;
              }
              td:first-child ,th:first-child {
                  border-color: black;
                  border-style: solid;
                  border-width: 1px 0px 1px 0px;
                  text-align: right;
              }
              td:last-child ,th:last-child {
                  border-color: black;
                  border-style: solid;
                  border-width: 1px 0px 1px 0px;
              }
              @page {
                  margin: 0;
                  padding: 0;
              }
              body {
                  font-family: Tahoma;
                  font-size: 14px;
                  border: 1.5px solid black;
                  margin: 0;
                  padding: 0;
              }
          </style>
      </head>`)
  }
}

function fillBody(type, string, data, table) {
  
  let sum = 0
  data.forEach(order => {
    sum += order.price
  });


  if (type == 'SIX') {
    string += (`<body style="margin: 0; width: 5cm;">
    <div style="text-align: center; font-size: 16px; font-weight: bold;
        border-bottom: 2px solid black; padding: 0.2cm;">${store.state.userModule.activeCafe.name }</div>
    <div style="background-color: #999999; text-align: center; font-size: 13px;
        border-bottom: 2px solid black; padding: 0.1cm;">فاکتور فروش</div>
    <div style="font-size: 10px; direction: rtl;
        border-bottom: 2px solid black; padding: 0.1cm;">
        <div style="display: flex; padding: 0.1cm;">
            <div style="width: 60%;">
                شماره: <span style="font-weight: bold; font-size: 12px;">${ table.joinNumber }</span>
            </div>
            <div style="width: 40%;">
            کاربر: ${store.state.userModule.user.fullName}
            </div>
        </div>
        <div style="display: flex; padding: 0.1cm;">
            <div style="width: 60%;">
                تاریخ: <span>${ new Date().toLocaleDateString("fa-IR") }</span>
            </div>
            <div style="width: 40%;">
                ساعت: <span>${ new Date().toLocaleTimeString("fa-IR") }</span>
            </div>
        </div>
    </div>
    <div style="text-align: center; font-size: 16px; font-weight: bold;
        padding: 0.2cm;">${ table.name }</div>
    <table style="direction: rtl; border-bottom: 2px solid black; font-size: 9px; border-collapse: collapse;">
        <tr>
            <th>
                عنوان
            </th>
            <th>
                تعداد
            </th>
            <th>
                فی
            </th>
            <th>
                قیمت کل
            </th>
        </tr>` )
    
        
        data.forEach(order => {
          string += `<tr>
          <td>
              ${ order.name }
          </td>
          <td>
              ${ order.number }
          </td>
          <td>
              ${ priceFormat(order.price / order.number) }
          </td>
          <td>
              ${ priceFormat(order.price) }
          </td>
      </tr>` 
        });
        string += (
          ` </table>
    <div style="background-color: #aaaaaa; text-align: center; font-size: 13px; font-weight: bold;
        border-bottom: 2px solid black; padding: 0.15cm;">جمع کل: ${ priceFormat(sum) } تومان</div>
    <div style="background-color: hsl(0, 0%, 60%); text-align: center; font-size: 11px;
        padding: 0.1cm;">cafepay.app کافه پی</div>
</body>
</html>`)
return string
  } else if (type == 'EIGHT') {
    string = (string + `<body style="margin: 0; width: 7cm;">
    <div style="text-align: center; font-size: 16px; font-weight: bold;
        border-bottom: 2px solid black; padding: 0.2cm;">${store.state.userModule.activeCafe.name }</div>
    <div style="background-color: #999999; text-align: center; font-size: 13px;
        border-bottom: 2px solid black; padding: 0.1cm;">فاکتور فروش</div>
    <div style="font-size: 13px; direction: rtl;
        border-bottom: 2px solid black; padding: 0.1cm;">
        <div style="display: flex; padding: 0.1cm;">
            <div style="width: 50%;">
                شماره: <span style="font-weight: bold; font-size: 14px;">${ table.joinNumber }</span>
            </div>
            <div style="width: 50%;">
            کاربر: ${store.state.userModule.user.fullName}
            </div>
        </div>
        <div style="display: flex; padding: 0.1cm;">
            <div style="width: 50%;">
                تاریخ: <span>${ new Date().toLocaleDateString("fa-IR") }</span>
            </div>
            <div style="width: 50%;">
                ساعت: <span>${ new Date().toLocaleTimeString("fa-IR") }</span>
            </div>
        </div>
    </div>
    <div style="text-align: center; font-size: 16px; font-weight: bold;
        padding: 0.2cm;">${ table.name }</div>
    <table style="direction: rtl; border-bottom: 2px solid black; font-size: 12px; border-collapse: collapse;">
        <tr>
            <th>
                عنوان
            </th>
            <th>
                تعداد
                </th>
                <th>
                    فی
                </th>
                <th>
                    قیمت کل
                </th>
            </tr>` )
        
            
            data.forEach(order => {
              string += `<tr>
              <td>
                  ${ order.name }
              </td>
              <td>
                  ${ order.number }
              </td>
              <td>
                  ${ priceFormat(order.price / order.number) }
              </td>
              <td>
                  ${ priceFormat(order.price) }
              </td>
          </tr>` 
            });
            string += (
              ` </table>
          <div style="background-color: #aaaaaa; text-align: center; font-size: 13px; font-weight: bold;
              border-bottom: 2px solid black; padding: 0.15cm;">جمع کل: ${ priceFormat(sum) } تومان</div>
          <div style="background-color: hsl(0, 0%, 60%); text-align: center; font-size: 11px;
              padding: 0.1cm;">cafepay.app کافه پی</div>
      </body>
      </html>`
            )
          return string
      }
    }
    
    function priceFormat (priceStr) {
        priceStr = priceStr + ""
        let result = ''
        for (var i = priceStr.indexOf(".") != -1 ? priceStr.indexOf(".") : priceStr.length; i > 3; i -= 3) {
            result = ',' + priceStr.slice(Math.max(i - 3, 0), i) + result
        }
        result = priceStr.slice(0, i) + result;
        let afterFixedPoint = (priceStr.indexOf(".") != -1 ? priceStr.slice(priceStr.indexOf(".") + 1, priceStr.length) : null);
        if(afterFixedPoint){
            result += '.';
            result += afterFixedPoint;
        }
        return result
      }
    
    export default {eightCMPrinter, sixCMPrinter}