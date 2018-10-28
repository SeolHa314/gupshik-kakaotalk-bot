let {PythonShell} = require('python-shell');
//let pyshell = new PythonShell('getgupshik.py');

var express = require('express');

var http = require('http');

var bodyParser = require('body-parser');

var app = express();

var schoolID = "";
var ifschoolID = 0;
var setschoolID = 0;
var selectedDay = 0;
var ifselected = 0;
var result = "";

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

function getgupshik(_schoolID, _day){
	var pyOptions = {
		mode: 'text',
		pythonPath: '/usr/bin/python3',
		pythonOptions: ['-u'],
		scriptPath: './',
		args: [_schoolID + ' ' + _day]
	}

	PythonShell.run('getgupshik.py', pyOptions, function(err, results) {
		if (err) throw err;

		result = results;
	});
	return;
}

app.get('/keyboard', function(req, res){
        var data = {
                'type' : 'buttons',
                'buttons' : ['Hi! Please read manual!']
        };
        res.json(data);
});

app.post('/message', function(req, res) {

	var msg = req.body.content;
	console.log('received message :' + msg);

	var send = {};

	switch(msg) {
		case 'Hi! Please read manual!':
		send = {
			'message': {
				'text': 'first, you have to set your school\'s code.\n\
				Then you can get your school\'s gupshik menu\n\
				Please select the menu.'
			},
			'keyboard': {
				'type': 'buttons',
				'buttons': ['today\'s gupshik', 'set school ID', 'get selected day\'s gupshik']
			}
		}
		break;

		case 'set school ID':
		send = {
			'message': {
				'text': 'Please input your school\'s ID!'
			}
		}
		ifschoolID = 1;
		setschoolID = 1;
		break;

		case 'today\'s gupshik':
		if(ifschoolID == 0) {
			send = {
				'message': {
					'text': "please set your school ID!"
				},
				'keyboard': {
					'type': 'buttons',
					'buttons': ['today\'s gupshik', 'set school ID', 'get selected day\'s gupshik']
				}
			}
			break;
		} else {
			getgupshik(schoolID, new Date().getDate())
			send = {
				'message': {
					'text': result
				}
			}
		}
		break;

		case 'get selected day\'s gupshik':
		if(ifschoolID == 0) {
			send = {
				'message': {
					'text': "please set your school ID!"
				},
				'keyboard': {
					'type': 'buttons',
					'buttons': ['today\'s gupshik', 'set school ID', 'get selected day\'s gupshik']
				}
			}
			break;
		} else if(ifselected == 0) {
			send = {
				'message': {
					'text': 'please input the day you want to know'
				}
			}
			ifselected = 1;
		}
		break;

		default:
		if(setschoolID == 1) {
			schoolID = msg;
			setschoolID = 0;
			ifschoolID = 1;
			send = {
				'message': {
					'text' : 'your schoolID is' + msg
				},
				'keyboard': {
					'type': 'buttons',
					'buttons': ['today\'s gupshik', 'set school ID', 'get selected day\'s gupshik']
				}
			}
			break;
		} else if(ifselected == 1) {
			getgupshik(schoolID, parseInt(msg))
			send = {
				'message': {
					'text' : result
				},
				'keyboard': {
					'type': 'buttons',
					'buttons': ['today\'s gupshik', 'set school ID', 'get selected day\'s gupshik']
				}
			}
			ifselected = 0;
			break;
		} else {
			send = {
				'message': {
					'text' : 'Error'
				},
				'keyboard': {
					'type': 'buttons',
					'buttons': ['today\'s gupshik', 'set school ID', 'get selected day\'s gupshik']
				}
			}
		}
	}

	res.json(send);
})

http.createServer(app).listen(9090, function() {
        console.log('server is running');
});
