function Decoder(bytes, port) {
    function decodeFrame(type, target)
    {
      switch(type & 0x7f) {
          case 0:
            target.emptyFrame = {};
            break;
          case 1:
            target.battery = {};
            target.battery = bytes[pos++];
            break;
          case 2:
            target.temperature = {}; 
            target.temperature.value = ((bytes[pos] & 0x80 ? 0xFFFF<<16 : 0) | (bytes[pos++] << 8) | bytes[pos++]) / 10;
            break;
          case 3:
          
            target.tempAlarm = {}; 
            target.tempAlarm.highAlarm = !!(bytes[pos] & 0x01);
            target.tempAlarm.lowAlarm = !!(bytes[pos] & 0x02); 
            pos++;
            break;
          case 4: 
            target.averageTemperature = {};
            target.averageTemperature.value = ((bytes[pos] & 0x80 ? 0xFFFF<<16 : 0) | (bytes[pos++] << 8) | bytes[pos++]) / 10;
            break;
          case 5:
 
            target.avgTempAlarm = {}; 
            target.avgTempAlarm.highAlarm = !!(bytes[pos] & 0x01); 
            target.avgTempAlarm.lowAlarm = !!(bytes[pos] & 0x02);
            pos++;
            break;
          case 6: 
            target.humidity = {};
            target.humidity.value = bytes[pos++] / 2; 
            break;
            break;
        case 80:
            target.humidity = {};
            target.humidity.value = bytes[pos++] / 2;
            target.temperature = {};
            target.temperature = ((bytes[pos] & 0x80 ? 0xFFFF<<16 : 0) | (bytes[pos++] << 8) | bytes[pos++]) / 10;
            break;
          case 81:
            target.humidity = {};
            target.humidity.value = bytes[pos++] / 2;
            target.averageTemperature = {};
            target.averageTemperature.value = ((bytes[pos] & 0x80 ? 0xFFFF<<16 : 0) | (bytes[pos++] << 8) | bytes[pos++]) / 10;
            break;
          case 112: 
            target.capacitanceFlood = {};
            target.capacitanceFlood.value = ((bytes[pos++] << 8) | bytes[pos++]); 
            break;
          case 113:
            target.capacitancePad = {};
            target.capacitancePad.value = ((bytes[pos++] << 8) | bytes[pos++]); 
            break;
          case 110:
            pos += 8;
            break;
          case 114:
            target.capacitanceEnd = {};
            target.capacitanceEnd.value = ((bytes[pos++] << 8) | bytes[pos++]); 
            break;
        }
    }
  
    var decoded = {};
    var pos = 0;
    var type;
  
    switch(port) {
      case 1:
        if(bytes.length < 2) {
          decoded.error = 'Wrong length of RX package';
          break;
        }
        decoded.historySeqNr = (bytes[pos++] << 8) | bytes[pos++];
        decoded.prevHistSeqNr = decoded.historySeqNr;
        while(pos < bytes.length) {
          type = bytes[pos++];
          if(type & 0x80)
              decoded.prevHistSeqNr--;
          decodeFrame(type, decoded);
        }
        break;
  
      case 2:
        var now = new Date();
        decoded.history = {};
        if(bytes.length < 2) {
          decoded.history.error = 'Wrong length of RX package';
          break;
        }	  
        var seqNr = (bytes[pos++] << 8) | bytes[pos++];
        while(pos < bytes.length) {
          decoded.history[seqNr] = {};
          decoded.history.now = now.toUTCString();
          secondsAgo = (bytes[pos++] << 24) | (bytes[pos++] << 16) | (bytes[pos++] << 8) | bytes[pos++];
          decoded.history[seqNr].timeStamp = new Date(now.getTime() - secondsAgo*1000).toUTCString();
          type = bytes[pos++];
          decodeFrame(type, decoded.history[seqNr]);
          seqNr++;
        }
    }
    return decoded;
  }
