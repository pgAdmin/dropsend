var setDisplayState = (selector, value) => {
  document.querySelector(selector).style.display = value;
};

var onAppLoad = () => {
  initiatePeerConnection();
  if (window.location.search.substr(1)) {
    document.querySelector("#receive_from").value = window.location.search.substr(1)
    document.querySelector("#drop_zone").style.display = "none";
  } else {
    document.querySelector("#receive_from").style.display = "none";
    document.querySelector("#receive_btn").style.display = "none";
  }
};

var initiatePeerConnection = () => {
  window.currentPeerId = (Date.now()  % 1000000 ).toString();
  window.myPeer = new Peer(window.currentPeerId, { host: 'dropsend-peer-5mwucnzwyq-uc.a.run.app', port: 443, path: '/myapp' });
  window.myPeer.on('connection', function(conn) {
    conn.on('open', function() {
      conn.send({
        fileName: window.files[0].name,
        fileBuffer: window.fileBuffer,
      });
    });
  });
};

var checkAppState = () => {
  var peerTargetId = document.querySelector("#receive_from").value;
  if (peerTargetId != "") {
    console.log(peerTargetId);
    var conn = window.myPeer.connect(peerTargetId);
    conn.on('open', function() {
      // Receive messages
      conn.on('data', function(data) {        
        console.log(data);
        var byteArray = new Uint8Array(data.fileBuffer);
        var url = window.URL.createObjectURL(new Blob([byteArray]));
        var link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", data.fileName);
        document.body.appendChild(link);
        link.click();
      });
    });
  }
};

var resetState = () => {
  setDisplayState("#one_drop_section", "none");
  setDisplayState("#drop_party_section", "none");
}

var selectMode = (mode) => {
  resetState();
  if (mode == 0) {
    setDisplayState("#one_drop_section", "block");
  } else if (mode == 1) {
    setDisplayState("#drop_party_section", "block");
  }
}

async function dropHandler(ev) {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (ev.dataTransfer.items[i].kind === 'file') {
        var file = ev.dataTransfer.items[i].getAsFile();
        window.files = [file];
        var bufferData = await file.arrayBuffer();
        window.fileBuffer = bufferData;
        document.querySelector("#drop_zone > p").innerText = '... file[' + i + '].name = ' + file.name;
        var downloadLink = window.location.origin + '/?'+window.currentPeerId
        // document.querySelector("#drop_zone #link").innerHTML = '<a href="' + downloadLink + '">Download From: ' + downloadLink + '</a>';
        document.querySelector("#drop_zone #link").innerHTML = 'Scan to Download';
        var qrcode = new QRCode(document.getElementById("qrcode"), {
          text: downloadLink,
          width: 160,
          height: 160,
          colorDark : "#000000",
          colorLight : "#ffffff",
          correctLevel : QRCode.CorrectLevel.H
        });
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
      console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
    }
  }
}

var dragOverHandler = (ev) => {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}