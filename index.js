//index.js
var fs = require('fs');
var archiver = require('archiver');
var express = require('express')
var session = require('express-session')
//var Cloudant = require('cloudant') //Cloudant connection
var mongoose = require('mongoose'); //Mongo Connect
var sha256 = require('sha256')
var fs = require('fs')
var app = express()
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
var path = require('path')
var bodyParser = require('body-parser')
var router = express.Router()
var mime = require('mime');
//MAILCHIMP API
var nodemailer = require("nodemailer");
var mandrillTransport = require('nodemailer-mandrill-transport');
//SCHEMAS
var Sucursal = require('./schemas/sucursal.js')
var Jof = require('./schemas/jof.js')
var Executive = require('./schemas/executive.js')
var Client = require('./schemas/client.js')
var Service = require('./schemas/services.js')
var Files = require('./schemas/files.js')
var Propiedad = require('./schemas/patrimonio/propiedad.js')
var Vehiculo = require('./schemas/patrimonio/vehiculo.js')
var Sociedad = require('./schemas/patrimonio/sociedad.js')
var Fileback = require('./schemas/patrimonio/fileback.js')
var Feedback = require('./schemas/feedback.js') //Temporal
var Notificacion = require('./schemas/notificacion.js')
//connection TO mongo DB
mongoose.connect('mongodb://localhost:27017/gestiona');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log('were connected!');
});
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static(path.join(__dirname, 'public'))); //Public tyles and js
app.set('view engine', 'ejs');// set the view engine to ejs
app.set('trust proxy', 1) // trust first proxy


//var mydb = cloudant.db.use('gestionadb');

/*
* Configuring mandrill transport.
* Copy your API key here.
*/

var smtpTransport = nodemailer.createTransport(mandrillTransport({
	auth: { apiKey : 'SlonvwMLlM_YYSYQbYxlvw' }
}));

app.use(session({secret: 'Bitter & Sweet Cocoa'}))
var port = process.env.PORT || 3000;
//ADMIN JUST 4 THIS FOO
var adminLogin = function (req, res, next) {
	if(req.body.q1 == 'GeStIoNaEsTo' && req.body.q2 == '3lJ4v1er35Bkn'){
		req.session.admin = { admin: 'Javier', nivel: 'Pulento' }
		next()
	} else {
		res.redirect('https://wikipedia.org')
	}
}
var adminIsLogin = function (req, res, next){
	if (req.session.admin) {
		next()
	} else {
		res.render('admin/pages/login',{mensaje: ''});
	}
}
var adminsPanel = function (req, res, next){
	var output = fs.createWriteStream(__dirname + '/respaldos.zip');
	var archive = archiver('zip');
	var informa = { total: '', message: '' }
	output.on('close', function() {
		informa.total = archive.pointer() + ' total bytes';
		informa.message = 'archiver has been finalized and the output file descriptor has closed.';
	});

	archive.on('error', function(err) {
		throw err;
	});

	archive.pipe(output);

	archive.bulk([
		{ expand: true, cwd: './uploads', src: ['**'] }
		]);

	archive.finalize();

	res.render('admin/pages/panel', {session: req.session.admin, page: 'panel', info: informa });
}
var downloadBackUp = function (req, res, next){
	res.download('./respaldos.zip', 'respaldos.zip');
}
//END ADMIN SHEETS
//ADD CLIENTS FEEDBACK
var addFeedback = function (req, res, next){
	req.body.client = req.session.user.rut
	req.body.sucursal = req.session.user.sucursal
	var newfeedback = Feedback(req.body)
	newfeedback.save(function (err) {
		if (err) {
			console.log(err);
		} else {
			next()
		}
	});
}
//Checking crucial data
var checkRut = function(req, res, next){
	Client.find({ rut: req.body.r }, function(err, result){
		if (result.length>0) {
			res.send({status: 'succes', rut: 'use' })
		} else {
			res.send({status: 'succes', rut: 'unused' })
		}
	})
}
var checkUser = function (req, res, next){
	Executive.find({ executive: req.body.e }, function(err, result){
		if (result.length>0) {
			res.send({status: 'succes', executive: 'use' })
		} else {
			res.send({status: 'succes', executive: 'unused' })
		}
	})
}
//Sending email to
var recoveryPassEmail = function(req, res, next){
	Client.find({ rut: req.body.r1 , recovery: 'false'}, function(err, result){
		if (result.length>0) {
			Client.update({ _id: result[0]._id }, { $set: { recovery: true } }, function (err, updateDoc) {
				if (err) {
					console.log(err);
					next()
				} else {
					var name = result[0].nombre + ' ' + result[0].apepa + ' ' + result[0].apema
					var token = result[0].token
					var urltoken = 'http://localhost:3000/clires?p=' + token
					var mailOptions = {
						from : '"Gestiona" <gestiona@careband.cl>',
						to : result[0].correo,
						subject : "Gestiona BCI Restableces Contraseña",
						html : "Estimado Sr (Sra) " + name + ",<br>Ha solicitado el poder restablecer su contraseña para ingresar a <b>Gestiona Bci</b><br><br><br>"
						+ "<a href='" + urltoken + "' target='a_blank' style='border: 2px rgb(13, 156, 90) solid; padding: 10px; border-radius: 4px; background: rgb(13, 156, 90); color: white; text-decoration: none; margin-left:4px;'>Clic para cambiar restablecer contraseña</a><br>"
						+ "<br><br>Si no ha sido usted favor ignore este correo.<br>"
						+ "<br><br>Saludos cordiales de parte del Equipo.<br><img style='width:320px;' src='https://gestiona.mybluemix.net/images/gestiona.png'>"
					};
          // Sending email.
          smtpTransport.sendMail(mailOptions, function(error, response){
          	if(error) {
          		throw new Error("Error in sending email");
          		next()
          	}else {
          		console.log("Message sent: " + JSON.stringify(response));
          		next()
          	}
          });
      }
  });

		} else {
      //result = []
      Client.find({ rut: req.body.r1 , recovery: 'true'}, function(err, result){
      	if (result.length > 0) {
      		console.log("Ya se envio un correo");
      		next()
      	} else {
          //no esta actualizado el schema
          Client.find({ rut: req.body.r1 }, function(err, result){
          	if (result.length>0) {
          		Client.update({ _id: result[0]._id }, { $set: { recovery: true } }, function (err, updateDoc) {
          			if (err) {
          				console.log(err);
          				next()
          			} else {
          				var name = result[0].nombre + ' ' + result[0].apepa + ' ' + result[0].apema
          				var token = result[0].token
          				var urltoken = 'http://localhost:3000/clires?p=' + token
          				var mailOptions = {
          					from : '"Gestiona" <gestiona@careband.cl>',
          					to : result[0].correo,
          					subject : "Gestiona BCI Restableces Contraseña",
          					html : "Estimado Sr (Sra) " + name + ",<br>Ha solicitado reestableces su contraseña para ingresar a <b>Gestiona Bci</b><br><br><br>"
          					+ "<a href='" + urltoken + "' target='a_blank' style='border: 2px rgb(13, 156, 90) solid; padding: 10px; border-radius: 4px; background: rgb(13, 156, 90); color: white; text-decoration: none; margin-left:4px;'>Clic para cambiar restablecer contraseña</a><br>"
          					+ "<br><br>Si no ha sido usted favor ignore este correo.<br>"
          					+ "<br><br>Saludos cordiales de parte del Equipo.<br><img style='width:320px;' src='https://gestiona.mybluemix.net/images/gestiona.png'>"
          				};
                  // Sending email.
                  smtpTransport.sendMail(mailOptions, function(error, response){
                  	if(error) {
                  		throw new Error("Error in sending email");
                  		next()
                  	}else {
                  		console.log("Message sent: " + JSON.stringify(response));
                  		next()
                  	}
                  });
              }
          });
          	} else {
          		console.log("el rut no esta registrado...");
          		next();
          	}
          });
      }
  })
  }
});
}
//EXECUTIVE USER SERVICES
var exUserServices = function (req, res, next){
	Service.find({ revision: 0 }, function(err, result) {
		if (err) {
			throw err;
			res.send({})
		} else {
			res.send(result)
		}
	});
}
//DOWNLOAD function
var download = function (req, res, next) {
	Files.find({  _id: req.query.goods }, function(er, result) {
		if (er) {
			throw er;
		} else {
			res.download('./uploads/' + result[0].filename, result[0].originalname);
		}
	});
}
var displayFile = function (req, res, next){
	Files.find({  _id: req.query.goods }, function(er, result) {
		if (er) {
			throw er;
		} else {
			var filePath = "./uploads/" +  result[0].filename;

			fs.readFile(filePath , function (err,data){
				res.contentType( result[0].mimetype);
				res.send(data);
			})
		}
	});
}
//Downlad filebacks
var downloadthis = function (req, res, next) {
	Fileback.find({  patrimonio: req.query.goods }, function(er, result) {
		if (er) {
			throw er;
		} else {
			res.download('./uploads/' + result[0].filename, result[0].originalname);
		}
	});
}
// DO USER LOGIN
var myLogger = function (req, res, next) {
	Client.find({ rut: req.body.q1, password: sha256(req.body.q2) }, function(er, result) {
		if (er) {
			throw er;
			res.render('user/pages/login',{mensaje: 'Nombre de usuario o contraseña incorrectos', type:'0'});
		}else{
			if (result.length>0) {
				var lastCredential = result.length - 1
				req.session.user = result[lastCredential]
				next();
			}else {
				res.render('user/pages/login',{mensaje: 'Nombre de usuario o contraseña incorrectos', type:'0'});
			}
		}
	});
};
// DO EXECUTIVE LOGIN
var executiveLog = function (req, res, next) {
	Executive.find({ executive: req.body.q1, password: sha256(req.body.q2) }, function(err, result) {
		if (err) {
			throw err;
			res.render('executive/pages/login',{mensaje: 'Nombre de usuario o contraseña incorrectos', type:'0'});
		} else {
			if (result.length>0) {
				req.session.executive = result[0]
				next();
			}else {
				res.render('executive/pages/login',{mensaje: 'Nombre de usuario o contraseña incorrectos', type:'0'});
			}
		}
	});
};
// login validating
var isLogin = function (req, res, next){
	if (req.session.user) {
		next()
	} else {
		res.render('user/pages/login',{mensaje: ''});
	}
}
//Login validation for api
var isLoginApi = function (req, res, next){
	if (req.session.user) {
		next()
	} else {
		res.send({"Codigo":203,"Mensaje":"Petición inválida."});
	}
}
//Executive login validation
var exeIsLogin = function (req, res, next){
	if (req.session.executive) {
		next()
	} else {
		res.render('executive/pages/login',{mensaje:''})
	}
}
//INSERT USER DOCS
var insertDoc = function (req, res, next){
	req.body.client = req.session.user.rut
	switch (req.body.tipo) {
		case 'propiedad':
		var addPropiedad = Propiedad(req.body)
		addPropiedad.save(function (err) {
			if (err) {
				console.log(err);
			} else {
				next()
			}
		});
		break;
		case 'vehiculo':
		var addVehiculo = Vehiculo(req.body)
		addVehiculo.save(function (err) {
			if (err) {
				console.log(err);
			} else {
				next()
			}
		});
		break;
		case 'sociedad':
		var addSociedad = Sociedad(req.body)
		addSociedad.save(function (err) {
			if (err) {
				console.log(err);
			} else {
				next()
			}
		});
		break;
		default:
		next()
	}
}
//INSERT USER SERVICES
var insertService = function (req, res, next){
	req.body.client = req.session.user.rut
	req.body.sucursal = req.session.user.sucursal
	var newService = Service(req.body)
	newService.save(function (err) {
		if (err) {
			console.log(err);
		} else {
			next()
		}
	});
}
//insert new Client
var newClient = function(req, res, next){
	var token = req.body.q1 + ";" + req.body.q5 + ";" + req.session.executive.executive
	var usuario = Client({
		manager: req.session.executive.executive,
		executive: req.session.executive.executive,
		sucursal: req.session.executive.sucursal,
		token: sha256(token),
		rut: req.body.q1,
		nombre: req.body.q2,
		apepa: req.body.q3,
		apema: req.body.q4,
		correo: req.body.q5
	})
	usuario.save(function (err) {
		if (err) {
			throw err;
		} else {
			next()
		}
	});
}
//Sending email to new Client
var newClientEmail =  function(req, res, next){
  // Put in email details.
  var token = req.body.q1 + ";" + req.body.q5 + ";" + req.session.executive.executive
  var name = req.body.q2 + " " + req.body.q3 + " " + req.body.q4
  var urltoken = 'http://localhost:3000/clic?p=' + sha256(token)
  var mailOptions = {
  	from : '"Gestiona" <gestiona@careband.cl>',
  	to : req.body.q5,
  	subject : "Bienvenido a Gestiona BCI",
  	html : "Estimado Sr (Sra) " + name + ",<br>Desde ya agradecemos su participación en nuestro piloto de <b>Gestiona Bci</b><br>"
  	+ "Le invitamos a completar su registro para acceder a todos los beneficios de este nuevo sistema.<br><br><br>"
  	+ "<a href='" + urltoken + "' target='a_blank' style='border: 2px rgb(13, 156, 90) solid; padding: 10px; border-radius: 4px; background: rgb(13, 156, 90); color: white; text-decoration: none; margin-left:4px;'>Clic para completar su registro</a><br>"
  	+ "<br><br>Saludos cordiales de parte del Equipo.<br><img style='width:320px;' src='https://gestiona.mybluemix.net/images/gestiona.png'>"
  };
  // Sending email.
  smtpTransport.sendMail(mailOptions, function(error, response){
  	if(error) {
  		throw new Error("Error in sending email");
  	}else {
  		console.log("Message sent: " + JSON.stringify(response));
  		next()
  	}
  });
}

//Validating the token to complete the reg for clients
var validatingToken = function(req, res, next){
	Client.find({ token: req.query.p, estado: false }, function(err, result) {
		if (err){
			throw err
		} else {
			if (result.length>0) {
				req.session.register = result[0]
				next()
			} else {
				res.redirect('/')
			}
		}

	});
}
//Middle process to validate the path
var middleProcessReg = function(req, res, next){
	if (req.session.register) {
		next()
	} else {
		res.redirect('/')
	}
}
//COMPLETE THE USER REG
var updateClient = function(req, res, next){
	Client.update({ _id: req.session.register._id },
	{
		$set: {
			estado: true,
			sexo: req.body.q1,
			estadocivil: req.body.q2,
			nacionalidad: req.body.q3,
			nacimiento: req.body.q4,
			hijos: req.body.q5,
			direccion: req.body.q6,
			ingreso: req.body.q7,
			situacion: req.body.q8,
			empleador: req.body.q9,
			password: sha256(req.body.q10)
		}
	}, function (err, updateDoc) {
		if (err) {
			console.log(err);
		} else {
			var name = req.session.register.nombre + ' ' + req.session.register.apepa + ' ' + req.session.register.apema
			var mailOptions = {
				from : '"Gestiona" <gestiona@careband.cl>',
				to : req.session.register.correo,
				subject : "¡Cuenta creada con éxito!",
				html : "Estimado Sr (Sra) " + name + ",<br>Se ha creado una cuenta exitosamente para comenzar a usar el sistema como <b>Cliente</b>,<br><br><br>"
				+ "desde ya puede ingresar a la plataforma en <a href='https://gestiona.mybluemix.net/' target='_blank'>https://gestiona.mybluemix.net/</a> con su RUT y contraseña"
				+ "<br><br>Saludos cordiales de parte del Equipo.<br><img style='width:320px;' src='https://gestiona.mybluemix.net/images/gestiona.png'>"
			};
      // Sending email.
      smtpTransport.sendMail(mailOptions, function(error, response){
      	if(error) {
      		throw new Error("Error in sending email");
      	}else {
      		console.log("Message sent: " + JSON.stringify(response));
      	}
      });
      res.render('user/pages/login',{mensaje: 'Registro Exitoso!, ya puede entrar al sistema', type:'1'})
  }
});
}
//Validating the token to complete password change
var validatingTokenRP = function(req, res, next){
	Client.find({ token: req.query.p, recovery: true }, function(err, result) {
		if (err){
			throw err
		} else {
			if (result.length>0) {
				req.session.recovery = result[0]
				next()
			} else {
				res.redirect('/')
			}
		}
	});
}
//Middle process to validate the path password change need to be different than the register
var middleProcessRP = function(req, res, next){
	if (req.session.recovery) {
		next()
	} else {
		res.redirect('/')
	}
}
//COMPLETE client Restore password must be different than the register
var clientRestorePassword = function(req, res, next){
	if (req.body.q10 == req.body.q20) {
		Client.update({ _id: req.session.recovery._id }, { $set: { recovery: false, password: sha256(req.body.q10) } }, function (err, updateDoc) {
			if (err) {
				console.log(err);
			} else {
				var name = req.session.recovery.nombre + ' ' + req.session.recovery.apepa + ' ' + req.session.recovery.apema
				var mailOptions = {
					from : '"Gestiona" <gestiona@careband.cl>',
					to : req.session.recovery.correo,
					subject : "¡Cuenta creada con éxito!",
					html : "Estimado Sr (Sra) " + name + ",<br>Se ha actulizado la contraseña de su cuenta exitosamente para comenzar a usar el sistema como <b>Cliente</b>.<br><br>"
					+ "Desde ya puede ingresar a la plataforma en <a href='https://gestiona.mybluemix.net/' target='_blank'>https://gestiona.mybluemix.net/</a> con su RUT y nueva contraseña"
					+ "<br><br>Saludos cordiales de parte del Equipo.<br><img style='width:320px;' src='https://gestiona.mybluemix.net/images/gestiona.png'>"
				};
        // Sending email.
        smtpTransport.sendMail(mailOptions, function(error, response){
        	if(error) {
        		throw new Error("Error in sending email");
        	}else {
        		console.log("Message sent: " + JSON.stringify(response));
        	}
        });
        res.render('user/pages/login',{mensaje: 'Actualización exitosa!, ya puede entrar al sistema', type:'1'})
    }
});
	} else {
		res.send("operation failed")
		console.log("Client dump");
	}
}
//HIDDEN GOOD
var hiddenDoc = function (req, res, next){
	var tipo = new Buffer(req.query.t, 'base64').toString('ascii')
	switch (tipo) {
		case 'propiedad':
		Propiedad.update({ _id: req.query.goods }, { $set: { estado: false }}, function (err, updateDoc) {
			if (err) {
				console.log(err);
			} else {
				next()
			}
		});
		break;
		case 'vehiculo':
		Vehiculo.update({ _id: req.query.goods }, { $set: { estado: false }}, function (err, updateDoc) {
			if (err) {
				console.log(err);
			} else {
				next()
			}
		});
		break;
		case 'sociedad':
		Sociedad.update({ _id: req.query.goods }, { $set: { estado: false }}, function (err, updateDoc) {
			if (err) {
				console.log(err);
			} else {
				next()
			}
		});
		break;
		default:
	}
}
//Validating User Goods
var validateDocument = function(req, res, next){
	var tipo = new Buffer(req.query.t, 'base64').toString('ascii')
	switch (tipo) {
		case 'propiedad':
		Propiedad.find({ _id: req.query.goods }, function(err, result) {
			if (err) {
				throw err;
			}else{
				if (result.length>0) {
					next()
				} else {
					console.log('not found');
					res.redirect('/')
				}
			}
		});
		break;
		case 'vehiculo':
		Vehiculo.find({ _id: req.query.goods }, function(err, result) {
			if (err) {
				throw err;
			}else{
				if (result.length>0) {
					next()
				} else {
					console.log('not found');
					res.redirect('/')
				}
			}
		});
		break;
		case 'sociedad':
		Sociedad.find({ _id: req.query.goods }, function(err, result) {
			if (err) {
				throw err;
			}else{
				if (result.length>0) {
					next()
				} else {
					res.redirect('/')
				}
			}
		});
		break;
		default:
	}
}
//DELETE FILE FROM DB
var deleteDoc = function (req, res, next){
	Files.remove({ _id: req.query.goods }, function(err) {
		if (err) {
			throw err;
		} else {
			next()
		}
	});
}
//Aprobing Services
var aprobingServices = function (req, res, next){
	var i = new Buffer(req.body.i, 'base64').toString('ascii')
	Service.update({ _id: i }, { $set:{ aprobado: true, fechafirma: req.body.d } }, function(err, updateDoc){
		if (err) {
			throw err;
		} else {
			Executive.find({ executive: req.session.user.executive }, function(err, result){
				var name = result[0].nombre + ' ' + result[0].apepa + ' ' + result[0].apema
				var propuesta = '[inserte propuesta aquí]'
				var mailOptions = {
					from : '"Gestiona" <gestiona@careband.cl>',
					to : result[0].correo,
					subject : "Gestiona BCI Informa",
					html : "Estimado Sr (Sra) " + name + ",<br>Informamos que el Cliente RUT: " + req.session.user.rut
					+ " Ha aceptado la propuesta generada, y se acercará a firmar documentos el <b>" + req.body.d + "</b><br>"
					+ "<br><br>Saludos cordiales de parte del Equipo.<br><img style='width:320px;' src='https://gestiona.mybluemix.net/images/gestiona.png'>"
				};
        // Sending email.
        smtpTransport.sendMail(mailOptions, function(error, response){
        	if(error) {
        		throw new Error("Error in sending email");
        	}else {
        		if(response.rejected.length == 0){
        			res.send({ status: 'success', email: 'send'})
        		} else {
        			res.send({ status: 'success', email: 'reject'})
        		}
        	}
        });
    });
		}
	});
}
//DELETE FILE FROM STORAGE
var deleteFile = function (req, res, next){
	fs.unlink('./uploads/' + new Buffer(req.query.cod, 'base64').toString('ascii'), function(er) {
		if (er) {
			throw er;
		}else{
			next()
		}
	});
}

//Update client revenue
var clientRevenues = function (req, res, next){
	Files.find({ client: req.session.user.rut , type: "Actualización de renta"}, function(err, result){
		if (err) {
			throw err;
		} else {
			if (result.length>5) {
				Client.update({ _id: req.session.user._id }, { $set: { estadorenta: true } }, function (err, updateDoc) {
					if (err) {
						throw err;
					} else {
						next()
					}
				});
			} else {
				Client.update({ _id: req.session.user._id }, { $set: { estadorenta: false } }, function (err, updateDoc) {
					if (err) {
						throw err;
					} else {
						next()
					}
				});
			}
		}
	});
}
//UNIVERSAL VALIDATING DOC
var validateFileDocument = function(req, res, next){
	Files.find({ _id: req.query.goods }, function(err, result) {
		if (err) {
			throw err;
		}else{
			if (result.length>0) {
				next()
			} else {
				res.redirect('/')
			}
		}
	});
}
//message update
var updateDoc = function(req, res, next){
	Service.update({ _id: req.body.service },
	{
		$set:
		{
			revision: 1,
			objetivo: req.body.objetivo,
			monto: req.body.monto,
			estado: req.body.estado,
			tasa: req.body.tasa,
			valorcuota: req.body.valorcuota,
			mensaje: req.body.message
		}
	}, function (err, updateDoc) {
		if (err) {
			throw err;
		} else {
			res.redirect('/executive/client?doc=' + req.body.usuario)
		}
	});
}
//update Client Profile
var updateProfile = function (req, res, next){
	Client.update({ _id: req.session.user._id },
	{
		$set: {
			estadocivil: req.body.estadocivil,
			hijos: req.body.hijos,
			direccion: req.body.direccion,
			ingreso: req.body.ingreso,
			situacion: req.body.situacion,
			empleador: req.body.empleador
		}
	}, function (err, updateDoc) {
		if (err) {
			console.log(err);
		} else {
			req.session.user.estadocivil = req.body.estadocivil
			req.session.user.hijos = req.body.hijos
			req.session.user.direccion = req.body.direccion
			req.session.user.ingreso = req.body.ingreso
			req.session.user.situacion = req.body.situacion
			req.session.user.empleador = req.body.empleador
			res.redirect('/')
		}
	});
}
//upload many files
var uploadFiles = function (req, res, next){
	req.files.map(function(v, i){
		req.files[i].client = req.session.user.rut
		req.files[i].type = req.body.type
		var newFiles = Files(req.files[i])
		newFiles.save(function (err) {
			if (err) {
				throw er;
			}
		});
	})
	next()
}
//Middle process to validate the path executive
var middleProcessRegExe = function(req, res, next){
	if (req.session.registerexe) {
		next()
	} else {
		res.redirect('/executive')
	}
}
//COMPLETE THE EXE REG
var updateExecutive = function(req, res, next){
	Executive.update({ _id: req.session.registerexe._id },
	{
		$set: {
			estado: true,
			rut: req.body.rut,
			telefono: req.body.telefono,
			password: sha256(req.body.q10)
		}
	}, function (err, updateDoc) {
		if (err) {
			console.log(err);
		} else {
			var name = req.session.registerexe.nombre + ' ' + req.session.registerexe.apepa + ' ' + req.session.registerexe.apema
			var mailOptions = {
				from : '"Gestiona" <gestiona@careband.cl>',
				to : req.session.registerexe.correo,
				subject : "¡Cuenta creada con éxito!",
				html : "Estimado Sr (Sra) " + name + ",<br>Se ha creado una cuenta exitosamente para comenzar a usar el sistema como <b>Ejecutivo</b>.<br>"
				+ "Desde ya puede ingresar a la plataforma en <a href='https://gestiona.mybluemix.net/executive' target='_blank'>https://gestiona.mybluemix.net/executive</a> con su nombre de usuario ( <b>" + req.session.registerexe.executive + "</b> ) y contraseña"
				+ "<br><br>Saludos cordiales de parte del Equipo.<br><img style='width:320px;' src='https://gestiona.mybluemix.net/images/gestiona.png'>"
			};
      // Sending email.
      smtpTransport.sendMail(mailOptions, function(error, response){
      	if(error) {
      		throw new Error("Error in sending email");
      	}else {
      		console.log("Message sent: " + JSON.stringify(response));
      	}
      });
      res.render('executive/pages/login',{mensaje: 'Registro Exitoso!, ya puede entrar al sistema', type:'1'})
  }
});
}
//Getting executive clients
var getClients = function(req, res, next){
	Client.find({ executive: req.session.executive.executive, estado: true }, function(err, result) {
		if (err){
			throw err;
		} else {
			res.render('executive/pages/panel', {session: req.session.executive, page: 'panel', clients: result});
		}
	});
}
// Getting user information
var getDocs = function (req, res, next){
	var documen = {}
	var propiedad = []
	var vehiculo = []
	var sociedad = []
	var objetos = []
	Files.find({ client: req.session.user.rut }, function(err, result) {
		if (err){
			throw err;
		} else {
			documen = result
			Propiedad.find({ client: req.session.user.rut, estado: true }, function(err, result) {
				if (err){
					throw err;
				} else {
					propiedad = result
					Vehiculo.find({ client: req.session.user.rut, estado: true }, function(err, result) {
						if (err){
							throw err;
						} else {
							vehiculo = result
							Sociedad.find({ client: req.session.user.rut, estado: true }, function(err, result) {
								if (err){
									throw err;
								} else {
									sociedad = result
									objetos.push({inmueble: propiedad})
									objetos.push({vehiculo: vehiculo})
									objetos.push({sociedad: sociedad})
									var renta = []
									var domicilio = []
									for (var i = 0; i < documen.length; i++) {
										if (documen[i].type=='Actualización de renta') { renta.push(documen[i]) }
											if (documen[i].type=='Comprobante de domicilio') { domicilio.push(documen[i]) }
										}
									res.render('user/pages/panel', {session: req.session.user, page: 'panel', docs: documen, objetos: objetos, renta: renta, domicilio: domicilio});
								}
							});
						}
					});
				}
			});
		}
	});
}
//GET Cliente PROFILE FOR EXECUTIVES
var getClienteProfile = function (req, res){
	var cliente = []
	var servicio = []
	var vehiculo = []
	var inmueble = []
	var sociedad = []
	var archivos = []
	Client.find({ rut: req.query.doc }, function(er, result) {
		if (er) {
			throw er;
		} else {
			if (result.length>0) {
				cliente.push({info: result[0]})
				Service.find({ client: req.query.doc }, function(err, result) {
					if (err) {
						throw err;
					} else {
						cliente.push({servicio: result})
						Propiedad.find({ client: req.query.doc, estado: true }, function(err, result) {
							if (err) {
								throw err;
							} else {
								cliente.push({inmueble: result})
								Vehiculo.find({ client: req.query.doc, estado: true }, function(err, result) {
									if (err) {
										throw err;
									} else {
										cliente.push({vehiculo: result})
										Sociedad.find({ client: req.query.doc, estado: true }, function(err, result) {
											if (err) {
												throw err;
											} else {
												cliente.push({sociedad: result})
												Files.find({ client: req.query.doc }, function(err, result) {
													if (err) {
														throw err;
													} else {
														cliente.push({archivos: result})
														res.render('executive/pages/panel', {session: req.session.executive, page: 'cliente', cliente: cliente});
													}
												});
											}
										});
									}
								});
							}
						});
					}
				});
			}
		}
	});
}
//Get Client's new mesages
var getMessages = function (req, res){
	Service.find({ client: req.session.user.rut, revision: 1 }, function(er, result) {
		if (er) {
			throw er;
		} else {
			var contexto  = {}
			var mensajes = []
			for (var i = 0; i < result.length; i++) {
				mensajes.push(result[i].mensaje)
			}
			contexto.Cantidad = result.length
			contexto.Listado = mensajes
			res.send(contexto)
		}
	});
}
//Update revision
var updateMessages = function (req, res, next){
	Service.update({ client: req.session.user.rut, revision:1 }, { $set: { revision: 2 }}, function (err, updateDoc) {
		if (err) {
			throw err;
		} else {
			next()
		}
	});
}
//SENDING A CHENGA STATE SERVICES EMAIL TO CLIENT
var sendingEmailToClient =  function(req, res, next){
	Client.find({ _id: req.body.darwing }, function(err, result) {
		if (err){
			throw err;
		} else {
      // Put in email details.}
      req.body.usuario = result[0].rut
      var mailOptions = {
      	from : '"Gestiona" <gestiona@careband.cl>',
      	to : result[0].correo,
      	subject : "Notificación de estado de servicio Gestiona BCI",
      	html : "Estimado Sr (Sra) " + result[0].nombre + "  " + result[0].apepa + " " + result[0].apema + ",<br>Su petición para <b>" + req.body.deseo +
      	"</b>, ha sido revisado y actualizado a <b>" + req.body.objetivo + "</b>, por un monto de <b>$" + Number(req.body.monto).toLocaleString() +
      	"</b>, a una tasa del <b>" +  req.body.tasa + "</b> a un valor cuota de <b>$" + Number(req.body.valorcuota).toLocaleString() + "</b><br> Su estado ha cambiado a <b>" + req.body.estado + "</b> con el siguiente mensaje adjunto:<br><br> -'<i>" +
      	req.body.message + "</i>'.<br><b>" + req.session.executive.nombre + " " + req.session.executive.apepa + "</b><br><br>Saludos cordiales de parte del <i>Equipo Gestiona</i>.<br><img style='width:320px;' src='https://gestiona.mybluemix.net/images/gestiona.png'>"
      };
      // Sending email.
      smtpTransport.sendMail(mailOptions, function(error, response){
      	if(error) {
      		throw new Error("Error in sending email");
      	}else {
      		console.log("Message sent: " + JSON.stringify(response));
      		next()
      	}
      });
  }
});
}
//Check if that user already exist
var rutExist = function (req, res){
	Client.find({ rut: req.body.doc }, function(er, result) {
		if (er) {
			throw er;
		} else {
			if (result.length > 0) {
				res.send({result: true})
			} else {
				res.send({result: false})
			}
		}
	});
}
//upload backfile function
var uploadBackfile = function(req, res, next){
	var tipo = new Buffer(req.body.t, 'base64').toString('ascii')
	req.files[0].patrimonio = req.body.darwing
	var newBackFiles = Fileback(req.files[0])
	newBackFiles.save(function (err) {
		if (err) {
			throw er;
		} else {
			switch (tipo) {
				case 'propiedad':
				Propiedad.update({ _id: req.body.darwing },
				{
					$set:
					{
						confirmado: true
					}
				}, function (err, updateDoc) {
					if (err) {
						throw err;
					} else {
						res.redirect('/')
					}
				});
				break;
				case 'vehiculo':
				Vehiculo.update({ _id: req.body.darwing },
				{
					$set:
					{
						confirmado: true
					}
				}, function (err, updateDoc) {
					if (err) {
						throw err;
					} else {
						res.redirect('/')
					}
				});
				break;
				case 'sociedad':
				Sociedad.update({ _id: req.body.darwing },
				{
					$set:
					{
						confirmado: true
					}
				}, function (err, updateDoc) {
					if (err) {
						throw err;
					} else {
						res.redirect('/')
					}
				});
				break;
				default:
				res.redirect('/')
			}
		}
	});
}
//read messages from jof
var showMessages = function(req, res, next){
	Notificacion.find({ executive: req.session.executive.executive, visto: false }, function(er, result) {
		if (er) {
			throw er;
		} else {
			if (result.length>0) {
				var notifica  =  result
				Client.find({ executive: req.session.executive.executive , estado: true }, function(err, result){
					if (err) {
						throw err;
					} else {
						var client = result
						Service.find({ sucursal: req.session.executive.sucursal }, function(err, result){
							if (err) {
								throw err;
							} else {
								var serv = result
								var data = { Cliente: [], Estado:'success', Message: notifica }
								for (var i = 0; i < client.length; i++) {
									var servCli = { serviciosPendientes: [], Cantidad: 0 }
									for (var x = 0; x < serv.length; x++) {
										if (serv[x].client == client[i].rut) {
											servCli.Cantidad ++;
											if (serv[x].estado!='Operación Exitosa') {
												servCli.serviciosPendientes.push({objetivo: serv[x].objetivo, registro: serv[x].registro, estado: serv[x].estado})
											}
										}
									}
									if (servCli.Cantidad>0) {
										var elClient = {Rut: client[i].rut, Nombre: client[i].nombre + ' ' + client[i].apepa + ' ' + client[i].apema, Pendientes: servCli}
										data.Cliente.push(elClient)
									}
								}
								res.send(data)
							}
						});
					}
				});
			} else {
				res.send({ Estado:'success', Message: 'No messages' })
			}
		}
	});
}
//Messages checked
var setMessagesAsCheck = function(req, res, next){
	Notificacion.update({ executive: req.session.executive.executive, visto: false }, { $set: { visto: true }}, function (err, updateDoc) {
		if (err) {
			throw err;
		} else {
			next()
		}
	});
}
//JOF FUNCTIONS
//LOGIN FOR JOF
var jofLogin = function (req, res, next){
	Jof.find({ jof: req.body.q1, password: sha256(req.body.q2) }, function(err, result) {
		if (err) {
			throw err;
			res.render('jof/pages/login',{mensaje: 'Nombre de usuario o contraseña incorrectos', type:'0'});
		} else {
			if (result.length>0) {
				req.session.jof = result[0]
				next();
			}else {
				res.render('jof/pages/login',{mensaje: 'Nombre de usuario o contraseña incorrectos', type:'0'});
			}
		}
	});
}
//Validating JOF session
var jofIsLogin = function (req, res, next){
	if (req.session.jof) {
		next()
	} else {
		res.render('jof/pages/login',{mensaje: ''});
	}
}
//new executive
var newExecutive = function(req, res, next){
	var token = req.body.q1 + ";" + req.body.q5 + ";" + req.session.jof.sucursal
	var newExe = Executive({
		sucursal: req.session.jof.sucursal,
		token: sha256(token),
		executive: req.body.q1,
		nombre: req.body.q2,
		apepa: req.body.q3,
		apema: req.body.q4,
		correo: req.body.q5
	})
	newExe.save(function (err) {
		if (err) {
			throw err;
		} else {
			next()
		}
	});
}
//Email to new Executive
var newExecutiveEmail =  function(req, res, next){
  // Put in email details.
  var token = req.body.q1 + ";" + req.body.q5 + ";" + req.session.jof.sucursal
  var name = req.body.q2 + " " + req.body.q3 + " " + req.body.q4
  var urltoken = 'http://localhost:3000/executive/clic?p=' + sha256(token)
  var mailOptions = {
  	from : '"Gestiona" <gestiona@careband.cl>',
  	to : req.body.q5,
  	subject : "Bienvenido a Gestiona BCI",
  	html : "Estimado Sr (Sra) " + name + ",<br>Se ha creado una cuenta a su nombre para comenzar a usar el sistema como <b>Ejecutivo</b><br><br><br>"
  	+ "<a href='" + urltoken + "' target='a_blank' style='border: 2px rgb(13, 156, 90) solid; padding: 10px; border-radius: 4px; background: rgb(13, 156, 90); color: white; text-decoration: none; margin-left:4px;'>Clic para completar su registro</a><br>"
  	+ "<br><br>Saludos cordiales de parte del Equipo.<br><img style='width:320px;' src='https://gestiona.mybluemix.net/images/gestiona.png'>"
  };
  // Sending email.
  smtpTransport.sendMail(mailOptions, function(error, response){
  	if(error) {
  		throw new Error("Error in sending email");
  	}else {
  		console.log("Message sent: " + JSON.stringify(response));
  		next()
  	}
  });
}
//Validating the token to complete the reg for Executive
var validatingExecutiveToken = function(req, res, next){
	Executive.find({ token: req.query.p, estado: false }, function(err, result) {
		if (err){
			throw err
		} else {
			if (result.length>0) {
				req.session.registerexe = result[0]
				next()
			} else {
				res.redirect('/')
			}
		}
	});
}
//Getting executives
var getExecutives = function (req, res, next){
	var executiveList = []
	var clientList = []
	var serviceList = []
	Executive.find({ sucursal: req.session.jof.sucursal, estado: true }, function(err, result) {
		if (err){
			throw err;
		} else {
			executiveList = result
			Client.find({ sucursal: req.session.jof.sucursal, estado: true }, function(err, result) {
				if (err){
					throw err;
				} else {
					clientList = result
					Service.find({ sucursal: req.session.jof.sucursal }, function(err, result) {
						if (err){
							throw err;
						} else {
							serviceList = result
							var allData = { executives: [] }
							for (var e = 0; e < executiveList.length; e++) {
								var allExec = {info: executiveList[e], clients: [], optotales: 0, oprealizadas: 0, clientsTotales: 0, clientsra: 0}
								var ot = 0
								var or = 0
								var allClie = {info: '', services: []}
								var numberClients = 0
								var rentaActualizada = 0
								for (var i = 0; i < clientList.length; i++) {
									if (clientList[i].executive == executiveList[e].executive) {
										numberClients ++
										allClie.info = clientList[i]
										if (clientList[i].estadorenta == true) {
											allExec.clientsra ++;
										}
										var allServ = []
										for (var s = 0; s < serviceList.length; s++) {
											if (clientList[i].rut == serviceList[s].client) {
												allClie.services.push(serviceList[s])
												if (serviceList[s].estado == "Operación Exitosa") or++;
												ot++;
											}
										}
									}
								}
								allExec.optotales = ot
								allExec.oprealizadas = or
								allExec.clientsTotales = numberClients
								allExec.clients.push(allClie)
								allData.executives.push(allExec)
							}
							res.render('jof/pages/panel', {session: req.session.jof, page: 'panel', executive: executiveList, clients: clientList, services: serviceList, data: allData});
						}
					});
				}
			});
		}
	});
}
//messages to executive
var sendMessage = function (req, res, next){
	req.body.jof = req.session.jof.jof
	req.body.sucursal = req.session.jof.sucursal
	req.body.executive = req.body.darwing
	var newNotificacion = Notificacion(req.body)
	newNotificacion.save(function (err) {
		if (err) {
			console.log(err);
		} else {
			next()
		}
	});
}
//Function get pending services
var pendingServicesDetails = function(req, res, next){
	Client.find({ sucursal: req.session.jof.sucursal, executive: req.body.e }, function(err, result) {
		if (err){
			throw err;
		} else {
			var client = result
			Service.find({ sucursal: req.session.jof.sucursal }, function(err, result) {
				if (err){
					throw err;
				} else {
					var service = result
					var data = []
					for (var i = 0; i < client.length; i++) {
						for (var a = 0; a < service.length; a++) {
							if (service[a].client == client[i].rut && service[a].estado != 'Operación Exitosa') {
								var nombre = client[i].nombre + ' ' + client[i].apepa + ' ' + client[i].apema
								data.push({client: {nombre: nombre, rut: client[i].rut}, service: {sueño: service[a].nombre, tipo: service[a].objetivo, monto: service[a].monto, estado: service[a].estado}})
							}
						}
					}
					res.send({status:'success', list: data})
				}
			});
		}
	});
}
//Executive information & Clients on hes charge
var executiveInfo = function (req, res, next){
	Client.find({ executive: req.body.e, estado: true }, function(err, result){
		var data = {status: 'success', clients: [], results: result.length, executives:[]}
		for (var i = 0; i < result.length; i++) {
			data.clients.push({ nombre: result[i].nombre + ' ' + result[i].apepa + ' ' + result[i].apema, rut: result[i].rut, correo: result[i].correo })
		}
		Executive.find({ sucursal: req.session.jof.sucursal, estado: true },function(err, resul){
			var executives = { executives: [], results: resul.length }
			for (var i = 0; i < resul.length; i++) {
				executives.executives.push({ executive: resul[i].executive, nombre: resul[i].nombre + ' ' + resul[i].apepa + ' ' + resul[i].apema, correo: resul[i].correo})
			}
			data.executives = executives
			res.send(data)
		});
	});
}
//Change Executive situation
var executiveSituation = function (req, res, next){
	Executive.update({ executive: req.body.e }, { $set: { situacion: req.body.s }}, function (err, updateDoc) {
		if (err) {
			throw err;
		} else {
			res.send({status: 'success'})
		}
	});
}
//change clients executive
var changeClientsExecutive = function (req, res, next){
	Client.update({ rut: req.body.r }, { $set: { executive: req.body.e }}, function (err, updateDoc){
		if (err) {
			throw err;
		} else {
			next()
		}
	})
}
//Send Email to notidy Executive Changes
var emailNotify = function (req, res, next){
	Client.find({ rut: req.body.r }, function (err, result){
		Executive.find({ executive: req.body.e }, function(err, resultado){
			var correo = result[0].correo
			var nombre = result[0].nombre + ' ' + result[0].apepa + ' ' + result[0].apema
			var manager = result[0].manager
			var ejecutivo = resultado[0].nombre + ' ' + resultado[0].apepa
			var correoEje = resultado[0].correo
			var estado = req.body.estado
			if(req.body.e == result[0].manager){
				var mailOptions = {
					from : '"Gestiona" <gestiona@careband.cl>',
					to : correo + ', ' + correoEje,
					subject : "Gestiona BCI Informa",
					html : "Estimado Sr (Sra) " + nombre + ",<br>Le informamos que su Ejecutivo <b>" + ejecutivo + "</b> se ha reincorporado a sus tareas, listo a atender sus solicitudes.<br>"
					+ "<br><br>Saludos cordiales de parte del Equipo.<br><img style='width:320px;' src='https://gestiona.mybluemix.net/images/gestiona.png'>"
				};
			} else {
				var mailOptions = {
					from : '"Gestiona" <gestiona@careband.cl>',
					to : correo + ', ' + correoEje,
					subject : "Gestiona BCI Informa",
					html : "Estimado Sr (Sra) " + nombre + ",<br>Le informamos que su ejecutivo esta <b>" + estado + "</b>, por lo que el ejecutivo <b>"
					+ ejecutivo + "</b> Será el ejecutivo responsable de atender sus solicitudes.<br>"
					+ "<br><br>Saludos cordiales de parte del Equipo.<br><img style='width:320px;' src='https://gestiona.mybluemix.net/images/gestiona.png'>"
				};
			}
      // Sending email.
      smtpTransport.sendMail(mailOptions, function(error, response){
      	if(error) {
      		throw new Error("Error in sending email");
      	}else {
      		console.log("Message sent: " + JSON.stringify(response));
      		res.redirect('/jof')
      	}
      });
  })
	})
}
//new JOF
var CreateNewJof = function (req, res, next){
	var token = sha256(req.body.nombre + ';' + req.body.apepa + ';' + req.body.apema + ';' + req.body.correo)
	var newJof = Jof({nombre: req.body.nombre, apepa: req.body.apepa, apema: req.body.apema, correo: req.body.correo , token: token})
	newJof.save(function (err) {
		if (err) {
			throw err;
		} else {
			next()
		}
	});
}
//new jof email
var newJofEmail = function (req, res, next) {
	var token = sha256(req.body.nombre + ';' + req.body.apepa + ';' + req.body.apema + ';' + req.body.correo)
	var name = req.body.nombre + " " + req.body.apepa + " " + req.body.apema
	var urltoken = 'http://localhost:3000/jof/clic?p=' + token
	var mailOptions = {
		from : '"Gestiona" <gestiona@careband.cl>',
		to : req.body.q5,
		subject : "Bienvenido a Gestiona BCI",
		html : "Estimado Sr (Sra) " + name + ",<br>Se ha creado una cuenta a su nombre para comenzar a usar el sistema como <b>JOF</b><br><br><br>"
		+ "<a href='" + urltoken + "' target='a_blank' style='border: 2px rgb(13, 156, 90) solid; padding: 10px; border-radius: 4px; background: rgb(13, 156, 90); color: white; text-decoration: none; margin-left:4px;'>Clic para completar su registro</a><br>"
		+ "<br><br>Saludos cordiales de parte del Equipo.<br><img style='width:320px;' src='https://gestiona.mybluemix.net/images/gestiona.png'>"
	};
  // Sending email.
  smtpTransport.sendMail(mailOptions, function(error, response){
  	if(error) {
  		throw new Error("Error in sending email");
  	}else {
  		console.log("Message sent: " + JSON.stringify(response));
  		next()
  	}
  });
}
//Validating jof token
var validatingJofToken = function (req, res, next) {
	Jof.find({ token: req.query.p, estado: false }, function(err, result) {
		if (err){
			throw err
		} else {
			if (result.length>0) {
				req.session.registerjof = result[0]
				next()
			} else {
				res.redirect('/')
			}
		}
	});
}
//middle process part 2
var middleProcessRegJof = function (req, res, next) {
	if (req.session.registerjof) {
		next()
	} else {
		res.redirect('/jof')
	}
}
//jof finish reg
var jofUpdate = function (req, res, next) {
	Jof.update({ _id: req.session.registerjof._id },
	{
		$set: {
			estado: true,
			jof: req.body.q1,
			sucursal: new Buffer(req.body.q2).toString('base64'),
			telefono: req.body.q3,
			password: sha256(req.body.q10)
		}
	}, function (err, updateDoc) {
		if (err) {
			console.log(err);
		} else {
			res.render('jof/pages/login',{mensaje: 'Registro Exitoso!, ya puede entrar al sistema', type:'1'})
		}
	});
}
//Creating sucursal
var newSucursal = function (req, res, next) {
	var sucu = new Buffer(req.body.q2).toString('base64')
	var fono = new Buffer(req.body.q3).toString('base64')
	var toke = sha256(sucu + ';' + fono)
	var newSucursal = Sucursal({
		jof:  req.body.q1,
		telefono: req.body.q3,
		direccion: req.body.q2,
		token: toke,
		sucursal: sucu
	})
	newSucursal.save(function (err) {
		if (err) {
			console.log(err);
		} else {
			next()
		}
	});
}
//GET Cliente PROFILE FOR JOF
var getClienteProfileJof = function (req, res){
	var cliente = []
	var servicio = []
	var vehiculo = []
	var inmueble = []
	var sociedad = []
	var archivos = []
	Client.find({ rut: req.query.doc }, function(er, result) {
		if (er) {
			throw er;
		} else {
			if (result.length>0) {
				cliente.push({info: result[0]})
				Service.find({ client: req.query.doc }, function(err, result) {
					if (err) {
						throw err;
					} else {
						cliente.push({servicio: result})
						Propiedad.find({ client: req.query.doc, estado: true }, function(err, result) {
							if (err) {
								throw err;
							} else {
								cliente.push({inmueble: result})
								Vehiculo.find({ client: req.query.doc, estado: true }, function(err, result) {
									if (err) {
										throw err;
									} else {
										cliente.push({vehiculo: result})
										Sociedad.find({ client: req.query.doc, estado: true }, function(err, result) {
											if (err) {
												throw err;
											} else {
												cliente.push({sociedad: result})
												Files.find({ client: req.query.doc }, function(err, result) {
													if (err) {
														throw err;
													} else {
														cliente.push({archivos: result})
														res.render('jof/pages/panel', {session: req.session.jof, page: 'cliente', cliente: cliente});
													}
												});
											}
										});
									}
								});
							}
						});
					}
				});
			}
		}
	});
}
//USER MIDDLE
//if is login
app.get('/', isLogin, getDocs);
//Complete Client Reg
app.get('/clic', validatingToken, function(req, res){ res.render('user/pages/registro',{mensaje: ''}); })
//Update password
app.get('/clires', validatingTokenRP, function(req, res){ res.render('user/pages/recovery',{ mensaje: '' });})
//DELETE USER GOODS
app.get('/delete', isLogin, validateDocument, hiddenDoc, function(req, res){ res.redirect('/') })
//DELETE FILES
app.get('/fileDelete', isLogin, validateFileDocument, deleteFile, deleteDoc, clientRevenues, function(req, res){ res.redirect('/') })
//USER REG UNABILBLE
//app.get('/registro', function(req, res){ res.render('user/pages/registro') })

//adding feedback
app.post('/feedback', isLogin, addFeedback, function(req, res){ res.redirect('/')})
//recovery
app.post('/recovery', recoveryPassEmail, function(req, res){ res.render('user/pages/result', {mensaje: ''}); })
//Manage a new services
app.get('/gestiona', isLogin, updateMessages, function(req, res, next){
	Service.find({ client: req.session.user.rut }, function(err, result) {
		if (err) {
			throw err;
		} else {
			if (result.length > 0) {
				res.render('user/pages/panel', {session: req.session.user, page: 'gestiona', servicios: result});
			} else {
				res.render('user/pages/panel', {session: req.session.user, page: 'gestiona', servicios: ''});
			}
		}
	});
});
//Cerrar sesión
app.get('/exit', function(req, res){
	req.session.destroy(function(err) {
		res.redirect('/');
	})
})
//Las message recibe from executive
app.get('/messages', isLoginApi, getMessages)
//LOGIN BY RUT & PASS
app.post('/', myLogger, getDocs);
//password recovery
app.post('/restore', middleProcessRP, clientRestorePassword);
//USER COMPLETE REG
app.post('/registro', middleProcessReg, updateClient)
//REG USER'S GOODS
app.post('/bien', isLogin, insertDoc,function(req, res){ res.redirect('/') });
//REG USER SERVICE
app.post('/servicio', isLogin, insertService, function(req, res){ res.redirect('/gestiona') })
//UPLOAD FILE
app.post('/upload', isLogin, upload.any(), uploadFiles, clientRevenues, function(req, res, next){
	res.redirect('/')
});
//Update Client profile
app.post('/updateprofile', isLogin, updateProfile)
//uploading Accreditation documents
app.post('/accreditation', isLogin, upload.any(), uploadBackfile)
//client aprobing propouse
app.post('/aproba', isLogin, aprobingServices)
//EXECUTIVE MIDDLE
//Go PANEL
app.get('/executive', exeIsLogin, getClients)
//Complete executive reg
app.get('/executive/clic', validatingExecutiveToken, function(req, res){ res.render('executive/pages/registro',{mensaje: ''}); })
//Cliente data view
app.get('/executive/client', exeIsLogin, getClienteProfile) //WAITING FOR A BETTER ALGORITM...
//EXECUTIVE SESSION DESTROY
app.get('/executive/exit', function(req, res){ req.session.destroy(function(err) { res.redirect('/executive'); }) })
//Download client files (boletas, facturas, liquidaciones e ivas)
app.get('/executive/download', exeIsLogin, download)
//display docs
app.get('/executive/gallery', exeIsLogin, displayFile)
//Download client files (respaldos de documentos)
app.get('/executive/downloadthis', exeIsLogin, downloadthis)
//GET EXECUTIVE NOTIFICATIONS OF NEW USER SERVICES
app.get('/executive/news', exeIsLogin, exUserServices)
app.get('/executive/executive/news', exeIsLogin, exUserServices)
//Recibe messages from JOF
app.get('/executive/messages', exeIsLogin, showMessages)
app.get('/executive/executive/messages', exeIsLogin, showMessages)
//Checked as saw
app.get('/executive/messagesChecked', exeIsLogin, setMessagesAsCheck, function(req, res, next){
	res.send({succes: true})
})
//new client register
app.get('/executive/register', exeIsLogin, function(req, res){ res.render('executive/pages/panel', {session: req.session.executive, page: 'register'});})
//Executive post
//finish executive reg
app.post('/executive/registro', middleProcessRegExe, updateExecutive)
//LOGIN BY EXECUTIVE USERNAME & PASS
app.post('/executive', executiveLog, getClients);
//Check if rut is avible
app.post('/executive/checkRut', exeIsLogin, checkRut)
//User reg by the executive
app.post('/executive/register', exeIsLogin, newClient, newClientEmail, function(req, res){ res.redirect('/executive')})
//sending message
app.post('/executive/message', exeIsLogin, sendingEmailToClient, updateDoc)
//validating if rut exist as client
app.post('/executive/clientid',rutExist)


//JOF MIDDLE
//GETS
app.get('/jof', jofIsLogin, getExecutives)
//Cerrar sesión
app.get('/jof/exit', function(req, res){
	req.session.destroy(function(err) {
		res.redirect('/jof');
	})
})
//Go to register
app.get('/jof/register', jofIsLogin, function(req, res){ res.render('jof/pages/panel', {session: req.session.jof, page: 'register'});})
//reg jof part 1
app.get('/jof/clic', validatingJofToken, function(req, res){ res.render('jof/pages/registro',{mensaje: ''}); })
//jof client view
app.get('/jof/client', jofIsLogin, getClienteProfileJof) //WAITING FOR A BETTER ALGORITM...
//POST
//DO THE LOGIN
app.post('/jof', jofLogin, getExecutives)
//SEND MESSAGE TO EXECUTIVE
app.post('/jof/notificar', jofIsLogin, sendMessage, function(req, res){
	res.redirect('/jof')
})
//check if executive username is avible
app.post('/jof/checkUser', jofIsLogin, checkUser)
//ADD NEW EXECUTIVE
app.post('/jof/register', jofIsLogin, newExecutive, newExecutiveEmail, function(req, res){ res.redirect('/jof')})
//get pending service details
app.post('/jof/psd', jofIsLogin, pendingServicesDetails)
//Get executive details
app.post('/jof/executive', jofIsLogin, executiveInfo)
//change executive situation
app.post('/jof/executiveSituation', jofIsLogin, executiveSituation)
//Change clients executive
app.post('/jof/modcliexe', jofIsLogin, changeClientsExecutive, emailNotify)
//Reg jof part 2
app.post('/jof/registro', middleProcessRegJof, newSucursal, jofUpdate)
//TESTING ROUTE
//app.get('/testing',rutExist)
//ADMINS 4 FOO
app.post('/admin', adminLogin, adminIsLogin, adminsPanel)
app.get('/admin', adminIsLogin, adminsPanel)
app.get('/admin/download', adminIsLogin, downloadBackUp)
app.get('/admin/exit', function(req, res){
	req.session.destroy(function(err) {
		res.redirect('/admin');
	})
})
//ENDS ADMINS FOO
//404 hanlder
app.use(function(req, res, next) {
	res.status(404).send('404! Ups aquí no hay nada!');
});
//Error handler
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Ups tenemos un error!');
});
// start the server
app.listen(port);
console.log(port + ' is the magic port');
