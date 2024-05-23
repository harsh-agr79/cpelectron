const { ipcRenderer } = window.electron;

if (ipcRenderer) {

  document.getElementById("confirmCartBtn").addEventListener('click', function() {
    var func  = "confirmCart";
    var dataset = sessionStorage.getItem("username");
    ipcRenderer.send("confirmCart", { func, dataset });

  });
  
  ipcRenderer.on('confirmCartResponse', (event, response) => {
    res = response.result;
    var toastHTML = `<span>${res}</span>`;
    M.toast({ html: toastHTML });
    $("ul.tabs").tabs("select", "currentOrder");
  })

  getRestaurantipc();
  function getRestaurantipc() {
    var func = "getRestaurants";
    var dataset = sessionStorage.getItem("username");
    ipcRenderer.send("getRestaurants", { func, dataset });
  }
  document.getElementById("orderTab").addEventListener("click", function () {
    getRestaurantipc();
  });

  function getCart() {
    var func = "getCart";
    var dataset = sessionStorage.getItem("username");
    ipcRenderer.send("getCart", { func, dataset });
  }

  function initializeCanvas() {
    const img = document.getElementById("grid-image");
    const canvas = document.getElementById("drawing-canvas");

    // Set canvas size to match image size
    canvas.width = img.clientWidth;
    console.log(img.clientWidth);
    console.log(img.clientHeight);
    canvas.height = img.clientHeight;
    canvas.style.width = `${img.clientWidth}px`;
    canvas.style.height = `${img.clientHeight}px`;
    canvas.style.position = 'absolute';
    canvas.style.top = `${img.offsetTop}px`;
    canvas.style.left = `${img.offsetLeft}px`;

    console.log("Canvas initialized");
}

  function addPinToGrid(gridNumber, path, coordinates) {
    const rows = 12;
    const cols = 12;
    const totalCells = rows * cols;

    if (gridNumber < 0 || gridNumber >= totalCells) {
      console.error("Invalid grid number");
      return;
    }

    const img = document.getElementById("grid-image");
    const canvas = document.getElementById("drawing-canvas");

    // Set canvas size to match image size
    canvas.width = img.clientWidth;
    console.log(img.clientWidth);
    console.log(img.clientHeight);
    canvas.height = img.clientHeight;
    canvas.style.width = `${img.clientWidth}px`;
    canvas.style.height = `${img.clientHeight}px`;
    canvas.style.position = 'absolute';
    canvas.style.top = `${img.offsetTop}px`;
    canvas.style.left = `${img.offsetLeft}px`;

    console.log("Canvas initialized");
    const container = img.parentElement;
    const rect = img.getBoundingClientRect();

    // Get image dimensions
    const imgWidth = img.clientWidth;
    const imgHeight = img.clientHeight;

    // Calculate the size of each grid cell
    const cellWidth = imgWidth / cols;
    const cellHeight = imgHeight / rows;

    // Calculate row and column of the grid number
    const row = Math.floor(gridNumber / cols);
    const col = gridNumber % cols;

    // Calculate center coordinates of the grid cell
    const centerX = col * cellWidth + cellWidth / 2;
    const centerY = row * cellHeight + cellHeight / 2;

    // Store coordinates for line drawing
    coordinates.push({ x: centerX + rect.left, y: centerY + rect.top });

    const pinIcon = document.createElement("img");

    if (gridNumber === path[0]) {
      pinIcon.src = "./mappin.webp";
      pinIcon.style.width = "12px";
    } else if (gridNumber === path[path.length - 1]) {
      pinIcon.src = "./dest.png";
      pinIcon.style.width = "20px";
    } else {
      pinIcon.style.width = "12px";
      pinIcon.src = "./bluedot.png";
    }
    pinIcon.style.position = "absolute";
    pinIcon.style.left = `${centerX + rect.left}px`;
    pinIcon.style.top = `${centerY + rect.top}px`;
    pinIcon.classList.add("pinco");

    container.appendChild(pinIcon);
  }

  function drawLines(coordinates) {
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    console.log("Drawing lines...");
    console.log("Canvas size:", canvas.width, canvas.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    coordinates.forEach((coord, index) => {
        console.log("Coordinate:", coord);
        // Convert coordinates to canvas-relative
        const x = (coord.x - rect.left + 5);
        const y = (coord.y - rect.top + 5);

        console.log("Drawing line to:", x, y);
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();
}


  function pinPathMap(path) {
    const coordinates = [];
    path.forEach((item) => {
      addPinToGrid(item, path, coordinates);
    });
    console.log(coordinates);
    drawLines(coordinates);
  }
  document.getElementById("cartTab").addEventListener("click", function () {
    const img = document.getElementById('grid-image');
     const canvas = document.getElementById("drawing-canvas");

    // Set canvas size to match image size
    canvas.width = img.clientWidth;
    console.log(img.clientWidth);
    console.log(img.clientHeight);
    canvas.height = img.clientHeight;
    canvas.style.width = `${img.clientWidth}px`;
    canvas.style.height = `${img.clientHeight}px`;
    canvas.style.position = 'absolute';
    canvas.style.top = `${img.offsetTop}px`;
    canvas.style.left = `${img.offsetLeft}px`;

    getCart();
    img.onload = function() {
        initializeCanvas();
    };
  });

  ipcRenderer.on("getCartResponse", (event, response) => {
    var res = response.result;
    console.log(res);
    const tableBody = document.getElementById("cartTableBody");
    var total = 0;

    tableBody.innerHTML = "";

    res.forEach((item) => {
      total += item.price * item.quantity;
      const row = `<tr id="${item.id}menutr">
      <td>${item.food}</td>
      <td>${item.category}</td>
      <td>${item.type}</td>
      <td>${item.quantity}</td>
      <td>${item.price}</td>
      <td>${item.price * item.quantity}<td>
      </tr>`;
      tableBody.innerHTML += row;
    });
    row = `<tr>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <th>Total</th>
    <th>${total}<th>
    </tr>`;
    tableBody.innerHTML += row;
    var func = "getPathCart";
    var dataset = [res[0].customerUsername, res[0].restaurantUsername].join(
      ","
    );
    // console.log(dataset)
    $("#resnameCart").text(res[0].resname);
    $("#resusernameCart").text(res[0].restaurantUsername);
    $('#editCartBtn').attr("onclick", `showMenu('${res[0].restaurantUsername}')`)
    ipcRenderer.send("getPathCart", { func, dataset });
  });

  ipcRenderer.on("getPathCartResponse", (event, response) => {
    var res = response.result;
    var arr = res.split("|");
    var distance = arr[0];
    var path = arr[1].split(",");
    $("#distanceCart").text(distance);
    $("#timetakenCart").text(
      Math.round((parseInt(distance) * 1000) / 500 + 20)
    );
    // $("#timetakenCart").text(arr[1]);
    pinPathMap(path);
  });

  ipcRenderer.on("getRestaurantResponse", (event, response) => {
    var res = response.result;
    const restList = document.getElementById("restList");
    restList.innerHTML = "";
    // res.sort((a,b) => parseInt(a.distance) - parseInt(b.distance));
    res.forEach((item) => {
      const restaurant = ` <div class="row mp-card restListItem" onclick="showMenu('${item.username}')">
          <div class="col s12"><h5>${item.restaurantName}</h5></div>
          <div class="col s12">${item.distance}000 Meters</div>
          <div class="col s12">${item.path}</div>
          <div class="col s12">${item.address}</div>
          <div class="col s12">${item.contact}</div>
        </div>`;
      restList.innerHTML += restaurant;
    });
  });

  function showMenu(username) {
    $("ul.tabs").tabs("select", "menuPage");
    var func = "getMenuCustomer";
    var dataset = [username, sessionStorage.getItem("username")].join(",");
    ipcRenderer.send("getMenuCustomer", { func, dataset });
    // $('#menuRestName').text(username);
    $("#menuContainer").text(username);
  }

  ipcRenderer.on("getMenuCustomerResponse", (event, response) => {
    var res = response.result;
    const menuBody = document.getElementById("menuContainer");
    // console.log(res);
    menuBody.innerHTML = "";
    $("#menuRestName").text(res[0].restaurantName);
    res.forEach((item) => {
      const menuItem = ` <div class="row mp-card">
     <input type="hidden" class="orderItemId" value="${item.id}" />
     <input type="hidden" class="orderItemResname" value="${item.restaurantName}" />
     <input type="hidden" class="orderItemUsername" value="${item.username}" />
     <input type="hidden" class="orderItemFood" value="${item.food}" />
     <input type="hidden" class="orderItemCategory" value="${item.category}" />
     <input type="hidden" class="orderItemType" value="${item.type}" />
     <input type="hidden" class="orderItemPrice" value="${item.price}" />
     <div class="col s4">${item.food}</div>
     <div class="col s4">${item.category}</div>
     <div class="col s4">${item.type}</div>
     <br>
     <br>
     <div class="col s6">${item.price}</div>
     <div class="col s6"><div class="row container">
     <span class="col s3 prod-btn" style="border-radius: 5px 0 0 5px;"
         onclick="minus('${item.id}')"><i class="material-icons">remove</i></span>
     <input type="hidden" class="prodids" name="prodid[]">
     <input type="number" min="0" class="col s6 browser-default inp qtys orderItemQuantity" value = "${item.quantity}" id="${item.id}cartinp"
         onchange="updatecart();" onkeyup="updatecart();" style="height: 32px; text-align:center; border-radius:0;"
         name="qty[]">
     <span class="col s3 prod-btn" style="border-radius: 0 5px 5px 0; "
         onclick="plus('${item.id}')"><i class="material-icons">add</i></span>
 </div></div>
   </div>`;
      menuBody.innerHTML += menuItem;
    });
  });

  const mapdom = document.getElementById("map");

  const gridnum = [];
  const gridsize = 12;

  let count = 0;
  for (let i = 0; i < gridsize; i++) {
    gridnum[i] = [];
    for (let j = 0; j < gridsize; j++) {
      gridnum[i][j] = count++;
    }
  }
  document.getElementById("map").addEventListener("click", function (e) {
    $("#pinicon").remove();
    const imgwidth = mapdom.width;
    const imgheight = mapdom.height;
    const cellwidth = imgwidth / gridsize;
    const cellheight = imgheight / gridsize;

    const rect = mapdom.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridX = Math.floor(x / cellwidth);
    const gridY = Math.floor(y / cellheight);

    const num = gridnum[gridY][gridX];
    const username = sessionStorage.getItem("username");
    const usertype = sessionStorage.getItem("usertype");
    var dataset = [username, usertype, num, e.clientX, e.clientY].join(",");
    var func = "setCustomerLocation";
    ipcRenderer.send("setCustomerLocation", { func, dataset });

    const pinIcon = document.createElement("img");
    pinIcon.src = "./mappin.webp"; // Replace 'location-pin.png' with your pin icon image URL
    pinIcon.style.position = "absolute";
    pinIcon.style.height = "20px";
    pinIcon.style.left = `${e.clientX}px`;
    pinIcon.style.top = `${e.clientY}px`;
    pinIcon.id = "pinicon";
    pinIcon.style.transform = "translate(-50%, -100%)"; // Adjust position for centering pin icon

    // Append the pin icon element to the document body or a container element
    document.body.appendChild(pinIcon);
  });

  ipcRenderer.on("customerLocationSet", (event, response) => {
    var res = response.result;
    console.log(res);
  });
  ipcRenderer.on("customerLocationGet", (event, response) => {
    $("#pinicon").remove();
    var res = response.result;
    // console.log(res);
    var data = res.split(",");
    const pinIcon = document.createElement("img");
    pinIcon.src = "./mappin.webp"; // Replace 'location-pin.png' with your pin icon image URL
    pinIcon.style.position = "absolute";
    pinIcon.style.height = "20px";
    pinIcon.style.left = `${data[3]}px`;
    pinIcon.style.top = `${data[4]}px`;
    pinIcon.id = "pinicon";
    pinIcon.style.transform = "translate(-50%, -100%)";

    document.body.appendChild(pinIcon);
  });
  document.getElementById("locationTab").addEventListener("click", () => {
    func = "getCustomerLocation";
    dataset = sessionStorage.getItem("username");
    ipcRenderer.send("getCustomerLocation", { func, dataset });
  });

  $(document).ready(function() {
    func = "getCustomerLocation";
    dataset = sessionStorage.getItem("username");
    ipcRenderer.send("getCustomerLocation", { func, dataset });
  })

  const elements = document.querySelectorAll(".tab");

  // Attach a click event listener to each element
  elements.forEach((element) => {
    element.addEventListener("click", (event) => {
      // Access the id of the clicked element
      const clickedId = event.target.id;

      if (clickedId != "locationTab" || clickedId != "cartTab") {
        $("#pinicon").remove();
        $(".pinco").remove();
      }
    });
  });

  function plus(id) {
    a = parseInt($(`#${id}cartinp`).val());
    a = a + 1;
    $(`#${id}cartinp`).val(a);
    updatecart();
  }

  function minus(id) {
    a = parseInt($(`#${id}cartinp`).val());
    if (a != 0) {
      a = a - 1;
      $(`#${id}cartinp`).val(a);
    }
    updatecart();
  }

  function updatecart() {
    var custUN = sessionStorage.getItem("username");
    var ids = $(".orderItemId")
      .map(function () {
        return this.value;
      })
      .get();
    var resname = $(".orderItemResname")
      .map(function () {
        return this.value;
      })
      .get();
    var username = $(".orderItemUsername")
      .map(function () {
        return this.value;
      })
      .get();
    var food = $(".orderItemFood")
      .map(function () {
        return this.value;
      })
      .get();
    var category = $(".orderItemCategory")
      .map(function () {
        return this.value;
      })
      .get();
    var type = $(".orderItemType")
      .map(function () {
        return this.value;
      })
      .get();
    var quantity = $(".orderItemQuantity")
      .map(function () {
        if (this.value > 0) {
          return this.value;
        } else {
          return "0";
        }
      })
      .get();
    var price = $(".orderItemPrice")
      .map(function () {
        return this.value;
      })
      .get();
    var count = ids.length;
    var data = [];

    for (i = 0; i < count; i++) {
      if (quantity[i] <= 0) {
        ids.splice(i, 1);
        resname.splice(i, 1);
        username.splice(i, 1);
        food.splice(i, 1);
        category.splice(i, 1);
        type.splice(i, 1);
        quantity.splice(i, 1);
        price.splice(i, 1);
        count--;
        i--;
      }
    }

    for (j = 0; j < count; j++) {
      data[j] = [
        custUN,
        resname[0],
        username[0],
        ids[j],
        food[j],
        category[j],
        type[j],
        quantity[j],
        price[j],
      ].join(",");
    }

    var dataset = [custUN, username[0], data.join("|")].join(",");
    // console.log(dataset);
    var func = "setUserCart";
    ipcRenderer.send("setUserCart", { func, dataset });
  }

  function goToCart(){
    $("ul.tabs").tabs("select", "cartPage");
  }

  ipcRenderer.on("userCartSet", (event, response) => {
    var res = response.result;
    var toastHTML = `<span>${res}</span><button class="btn-flat toast-action" onclick="goToCart()">Check Out</button>`;
    M.toast({ html: toastHTML });
  });
} else {
  console.error("ipcRenderer is not properly initialized.");
}
