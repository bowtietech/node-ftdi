var ftdi = require('./index');


// Device testing
console.log("Device Test:");

ftdi.find(0x6014, 0x0403, function (err, devices, test) {
    // ftdi.find(12, 12, function (err, devices, test) {
    // ftdi.find(0x27f4, 0x0203, function (err, devices, test) {
    console.log("FTDI Devices: ");
    console.log(devices);
    console.log("FTDI Error: ");
    console.log(err);
    console.log("FTDI Test: ");
    console.log(test);

    var device = new ftdi.FtdiDevice(0); // index in list function

    device.on('error', function (err) {
        console.log('Device Error');
        console.log(err);
    });

    device.open({
            baudrate: 115200,
            databits: 8,
            stopbits: 1,
            parity: 'none',
            // bitmode: 'cbus', // for bit bang
            // bitmask: 0xff    // for bit bang
        },
        function (err) {
            console.log('Open Error');
            console.log(err);

            device.on('data', function (data) {
            console.log('Received');
            console.log(data.toString());

            });

            device.write([0x01, 0x02, 0x03, 0x04, 0x05], function (err) {
            console.log('Write Error');
            console.log(err);
            });

        });


})