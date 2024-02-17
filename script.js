 /*function printReceipt() {    const receiptContent = generateReceiptContent(); // Generate the receipt content

    // Print the receipt content directly
    sendTextData(receiptContent)
        .then(() => {
            clearAddedItems(); // Clear added items after printing
        })
        .catch(error => {
            // Handle printing errors
            //alert("Error printing receipt: " + error);
        });
}
*/

function printReceipt() {
  const receiptContent = generateReceiptContent(); // Generate the receipt content, which is an array of strings
alert(receiptContent);
  // Map each content item to a sendTextData promise
  const sendPromises = receiptContent.map(contentItem => sendTextData(contentItem));

  // Wait for all send operations to complete
  Promise.all(sendPromises)
      .then(() => {
          clearAddedItems(); // Clear added items after printing
      })
      .catch(error => {
          // Handle printing errors
          console.error("Error printing receipt: ", error); // Consider informing the user through UI instead of console
      });
}



  
     function sendPrinterData() {
    sendTextData()
      .then(() => {
        progress.hidden = true;
      })
      .catch(handleError);
  }

  printButton.addEventListener('click', function () {
    progress.hidden = true;
    if (printCharacteristic == null) {
      navigator.bluetooth.requestDevice({
        filters: [{
          services: ['000018f0-0000-1000-8000-00805f9b34fb']
        }]
      })
        .then(device => {
          console.log('> Found ' + device.name);
          console.log('Connecting to GATT Server...');
          return device.gatt.connect();
        })
        .then(server => server.getPrimaryService("000018f0-0000-1000-8000-00805f9b34fb"))
        .then(service => service.getCharacteristic("00002af1-0000-1000-8000-00805f9b34fb"))
        .then(characteristic => {
          // Cache the characteristic
          printCharacteristic = characteristic;
           printReceipt();
         // sendPrinterData();

        })
        .catch(handleError);
    } else {
           printReceipt();
    }
  });
});// Object to store added items and their quantities

function clearAddedItems() {
  for (const item in addedItems) {
    delete addedItems[item];
  }
  // Update the display
  updateAddedItemDisplay();
}
const addedItems = {};

async function createButtonsFromCSV() {
  try {
  const timestamp = new Date().getTime(); // This gives you the current timestamp

// Construct the URL with the timestamp appended to it
const url = `menu.csv?timestamp=${timestamp}`;

// Fetch the CSV file with the timestamp appended
const response = await fetch(url);     
    const csvData = await response.text();

    // Parse CSV data
    const rows = csvData.split('\n');
    const headers = rows[0].split(',');

    // Extract item data from CSV
    const items = rows
      .filter(row => row.trim() !== '') // Filter out empty lines
      .slice(1)
      .map(row => {
        const values = row.split(',');
        const item = {};

        headers.forEach((header, index) => {
          const trimmedHeader = header.trim();
          const trimmedValue = values[index] !== undefined ? values[index].trim() : '';

          if (trimmedValue !== '') {
            item[trimmedHeader] = trimmedValue;
          } else {
            console.error(`Value for header '${trimmedHeader}' is missing in row: ${row}`);
          }
        });

        console.log('Parsed item:', item); // Add this line for debugging

        return item;
      });

    console.log('All items:', items); // Add this line for debugging

    // Create buttons
    createButtons(items);
  } catch (error) {
    console.error('Error reading CSV file:', error);
  }
}


// Function to create clickable buttons
function createButtons(data) {
  var buttonContainer = document.getElementById('button-container');

  data.forEach(function (item, index) {
    var button = document.createElement('button');
    button.innerHTML = `${item.Item} - Rs${item.Price}`;
    button.className = 'button';
    button.id = `button-${index + 1}`;
    button.addEventListener('click', function () {
      addItem(item.Item, item.Price);
    });

    buttonContainer.appendChild(button);
  });
}

// Function to add item to the "Added Items" partition
function addItem(item, price) {
  const addedItemsContainer = document.getElementById('added-items');

  // Check if the item is already added
  if (addedItems[item]) {
    // Increment quantity if the item is already in the list
    addedItems[item].quantity += 1;
  } else {
    // Add the item to the list with quantity 1
    addedItems[item] = { price: price, quantity: 1 };
  }

  // Update the display and summary
  updateAddedItemDisplay();
  updateSummary();
}
 function displayAddedItem(item, price, quantity) {  const addedItemsContainer = document.getElementById('added-items');
  const newItemContainer = document.createElement('div');
  newItemContainer.className = 'added-item';

  const itemInfoContainer = document.createElement('div');
  itemInfoContainer.className = 'item-info';

  const itemName = document.createElement('span');
  itemName.className = 'item-name';
  itemName.textContent = item;

  const itemPrice = document.createElement('span');
  itemPrice.className = 'item-price';
  itemPrice.textContent = `Rs${price * quantity}`;

  const quantityButtons = document.createElement('div');
  quantityButtons.className = 'quantity-buttons';

  const minusButton = document.createElement('span');
  minusButton.className = 'quantity-button';
  minusButton.innerHTML = '-';
  minusButton.addEventListener('click', function () {
    if (addedItems[item].quantity > 1) {
      addedItems[item].quantity -= 1;
      updateAddedItemDisplay();
      updateSummary();
    } else {
      delete addedItems[item];
      updateAddedItemDisplay();
      updateSummary();
    }
  });

  const quantityDisplay = document.createElement('span');
  quantityDisplay.className = 'quantity';
  quantityDisplay.textContent = quantity;

  const plusButton = document.createElement('span');
  plusButton.className = 'quantity-button';
  plusButton.innerHTML = '+';
  plusButton.addEventListener('click', function () {
    addedItems[item].quantity += 1;
    updateAddedItemDisplay();
    updateSummary();
  });

  // Append elements to the itemInfoContainer
  itemInfoContainer.appendChild(itemName);
  itemInfoContainer.appendChild(document.createElement('br')); // Add line break for spacing
  itemInfoContainer.appendChild(itemPrice);

  // Append elements to the quantityButtons container
  quantityButtons.appendChild(minusButton);
  quantityButtons.appendChild(quantityDisplay);
  quantityButtons.appendChild(plusButton);

  // Append itemInfoContainer and quantityButtons to the newItemContainer
  newItemContainer.appendChild(itemInfoContainer);
  newItemContainer.appendChild(quantityButtons);

  // Add an empty line after each record
  newItemContainer.appendChild(document.createElement('p'));
  newItemContainer.appendChild(document.createElement('br'));
  newItemContainer.appendChild(document.createElement('br'));

  // Append newItemContainer to addedItemsContainer
  addedItemsContainer.appendChild(newItemContainer);
}
// Function to update the display of added item quantity
function updateAddedItemDisplay() {
  const addedItemsContainer = document.getElementById('added-items');
  addedItemsContainer.innerHTML = '<h2>Order Summary:</h2>';

  // Iterate through added items and display them
  for (const item in addedItems) {
    displayAddedItem(item, addedItems[item].price, addedItems[item].quantity);
  }
}


// Function to update the summary
function updateSummary() {
  const summaryDiv = document.getElementById('summary');
  const priceSpan = document.getElementById('price');
  const taxSpan = document.getElementById('tax');
  const totalSpan = document.getElementById('total');

  // Calculate the total price, tax, and overall total
  let totalPrice = 0;

  for (const item in addedItems) {
    totalPrice += addedItems[item].price * addedItems[item].quantity;
  }

  const tax = totalPrice * 0.05; // Assuming tax is 18%
  const total = totalPrice + tax;

  // Update the summary display
  priceSpan.textContent = totalPrice.toFixed(2);
  taxSpan.textContent = tax.toFixed(2);
  totalSpan.textContent = total.toFixed(2);
}

/*
 function generateReceiptContent() {
  const currentDate = new Date();
const formattedDate = currentDate.toDateString();
const formattedTime = currentDate.toLocaleTimeString();

  let content = '';

  // Header with Rectangle around "Campus savories" and spaces added
  content += '--------------------------------\n';

  content += '        Campus savories         \n';     
  content += '--------------------------------\n';
content += `Bill No.: #1\n`;
content += 'GST No-29ABEPS2937F1ZF\n';
 content += `Time.:  ${formattedTime}\n`;  content += '--------------------------------\n';

content += '          INVOICE \n';
content += '--------------------------------\n';

content += 'Item        Quantity      Amount\n';
 

let totalAmount = 0;
 

// Loop through added items and display them in the table
for (const item in addedItems) {
const itemName = item.toString(); // Use the item itself as the name
const itemCost = addedItems[item].price * addedItems[item].quantity;

// Item Row with adjusted spacing and line break for long item names
//const itemRow = `${itemName}${addedItems[item].quantity.toString()}${itemCost.toFixed(2)}\n`;
const itemRow = `${itemName.slice(0, 10).padEnd(14)}${addedItems[item].quantity.toString().padEnd(10)}${itemCost.toFixed(2)}\n`;
//content += itemRow;
content += itemRow;

// If the item name is too long, add the remaining part on the next line
if (itemName.length > 10) {
  content += `${itemName.slice(10)}\n`;
}

totalAmount += itemCost;
}

content += '--------------------------------\n';
content += `Total Amount:         Rs ${totalAmount.toFixed(2)}\n`;
// Calculate 5% tax (GST) on the total amount
const tax = totalAmount * 0.05;

// Calculate the grand total by adding the tax to the total amount
const grandTotal = totalAmount + tax;

content += `GST (5%):             Rs  ${tax.toFixed(2)}\n`;
const roundedGrandTotal = grandTotal % 1 === 0 ? grandTotal : Math.ceil(grandTotal);

// Calculate the round-off amount (always positive)
const roundOff = roundedGrandTotal - grandTotal;
// Calculate the round off amount


content += `Round Up:             Rs  ${roundOff.toFixed(2)}\n`;

// Add the rounded grand total
content += `Grand Total:          Rs ${Math.round(roundedGrandTotal).toFixed(2)}\n`;
content += '--------------------------------\n';

  return content;
}
 
*/ 






function generateReceiptContent() {
  const currentDate = new Date();
  const formattedTime = currentDate.toLocaleTimeString();

  let content = [];

  // Header with Rectangle around "Campus savories" and spaces added
  content.push('--------------------------------');
  content.push('        Campus savories         ');
  content.push('--------------------------------');
  content.push(`Bill No.: #1`);
  content.push('GST No-29ABEPS2937F1ZF');
  content.push(`Time.:  ${formattedTime}`);
  content.push('--------------------------------');
  content.push('          INVOICE ');
  content.push('--------------------------------');
  content.push('Item        Quantity      Amount');

  let totalAmount = 0;

  // Loop through added items and display them in the table
  for (const item in addedItems) {
    const itemName = item.toString(); // Use the item itself as the name
    const itemCost = addedItems[item].price * addedItems[item].quantity;

    // Item Row with adjusted spacing and line break for long item names
    const itemRow = `${itemName.slice(0, 10).padEnd(14)}${addedItems[item].quantity.toString().padEnd(10)}${itemCost.toFixed(2)}`;
    content.push(itemRow);

    // If the item name is too long, add the remaining part on the next line
    if (itemName.length > 10) {
      content.push(`${itemName.slice(10)}`);
    }

    totalAmount += itemCost;
  }

  content.push('--------------------------------');
  content.push(`Total Amount:         Rs ${totalAmount.toFixed(2)}`);
  // Calculate 5% tax (GST) on the total amount
  const tax = totalAmount * 0.05;

  // Calculate the grand total by adding the tax to the total amount
  const grandTotal = totalAmount + tax;

  content.push(`GST (5%):             Rs  ${tax.toFixed(2)}`);
  const roundedGrandTotal = grandTotal % 1 === 0 ? grandTotal : Math.ceil(grandTotal);

  // Calculate the round-off amount (always positive)
  const roundOff = roundedGrandTotal - grandTotal;
  // Calculate the round off amount
  content.push(`Round Up:             Rs  ${roundOff.toFixed(2)}`);

  // Add the rounded grand total
  content.push(`Grand Total:          Rs ${Math.round(roundedGrandTotal).toFixed(2)}`);
  content.push('--------------------------------');

  return content;
}


// Call the function to create buttons from CSV
createButtonsFromCSV();
