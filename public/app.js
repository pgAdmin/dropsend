var setDisplayState = (selector, value) => {
  document.querySelector(selector).style.display = value;
};

var initiatePeerConnection = () => {
  window.currentPeerId = Date.now().toString();
  window.myPeer = new Peer(window.currentPeerId, { host: 'localhost', port: 9000, path: '/myapp' });
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
        document.querySelector("#drop_zone > div").innerText = 'My peer id: ' + window.currentPeerId;
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