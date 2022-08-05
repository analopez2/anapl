var map;
var urlBaseImage = 'https://crypto.develotion.com/imgs/';

async function cargando(message) {
  const loading = await loadingController.create({
    message: message,
  });
  return await loading;
}

async function presentAlert(header, sub_header, message) {
  const alert = document.createElement('ion-alert');
  alert.header = header;
  alert.subHeader = sub_header;
  alert.message = message;
  alert.buttons = ['OK'];
  document.body.appendChild(alert);
  await alert.present();
}

function display_toast(mensaje, header, color) {
  const toast = document.createElement('ion-toast');
  toast.header = header;
  (toast.icon = 'information-circle'), (toast.position = 'top');
  toast.message = mensaje;
  toast.duration = 3000;
  toast.color = color;
  document.body.appendChild(toast);
  toast.present();
}

function login(data, router) {
  localStorage.setItem('apiKey', data.apiKey);
  localStorage.setItem('id', data.id);
  router.push('/monedas');
}

function logout() {
  localStorage.removeItem('apiKey');
  localStorage.removeItem('id');
}

function getDepartamentos() {
  let url = 'https://crypto.develotion.com/departamentos.php';

  fetch(url, {
    headers: {
      'Content-type': 'application/json',
    },
  })
    .then((respuesta) =>
      respuesta.ok
        ? respuesta.json()
        : respuesta.json().then((data) => Promise.reject(data.error)),
    )
    .then((data) =>
      data.departamentos.forEach((departamento) => {
        document.getElementById(
          'txtDepartamento',
        ).innerHTML += `<ion-select-option value="${departamento.id}">${departamento.nombre}</ion-select-option>`;
      }),
    )
    .catch(
      (mensaje) =>
        (document.getElementById(
          'div_departamento',
        ).innerHTML += `<p>${data.error}</>`),
    );
}

function getCiudadesByDepartamento(idDepartamento) {
  let url = `https://crypto.develotion.com/ciudades.php?idDepartamento=${idDepartamento}`;

  fetch(url, {
    headers: {
      'Content-type': 'application/json',
    },
  })
    .then((respuesta) =>
      respuesta.ok
        ? respuesta.json()
        : respuesta.json().then((data) => Promise.reject(data.error)),
    )
    .then((data) =>
      data.ciudades.forEach((ciudad) => {
        document.getElementById(
          'txtCiudad',
        ).innerHTML += `<ion-select-option value="${ciudad.id}">${ciudad.nombre}</ion-select-option>`;
      }),
    )
    .catch(
      (mensaje) =>
        (document.getElementById(
          'div_ciudad',
        ).innerHTML += `<p>${data.error}</>`),
    );
}

function clearInputs(entity) {
  if (entity == 'registro') {
    document.getElementById('inp_usuario').value = '';
    document.getElementById('inp_password').value = '';
    document.getElementById('txtDepartamento').value = '';
    document.getElementById('txtCiudad').value = '';
  }

  if (entity == 'login') {
    document.getElementById('txtUsuario').value = '';
    document.getElementById('txtContrasenia').value = '';
  }

  if (entity == 'transaccion') {
    document.getElementById('txtCantidad').value = '';
    document.getElementById('txtTipoOperacion').value = '';
  }
}

function getParam(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getMonedas() {
  cargando('Cargando monedas...').then((loading) => {
    loading.present();
    let apiKey = localStorage.getItem('apiKey');
    let url = 'https://crypto.develotion.com/monedas.php';
    fetch(url, {
      headers: {
        'Content-type': 'application/json',
        apiKey: apiKey,
      },
    })
      .then((respuesta) =>
        respuesta.ok
          ? respuesta.json()
          : respuesta.json().then((data) => Promise.reject(data.mensaje)),
      )
      .then((data) => crearListadoDeMonedas(data))
      .catch((mensaje) => display_toast(mensaje, 'Info', 'primary'))
      .finally(() => loading.dismiss());
  });
}

function getTransacciones() {
  cargando('Cargando transacciones...').then((loading) => {
    loading.present();
    let apiKey = localStorage.getItem('apiKey');
    let idUsuario = localStorage.getItem('id');
    let url = `https://crypto.develotion.com/transacciones.php?idUsuario=${idUsuario}`;
    fetch(url, {
      headers: {
        'Content-type': 'application/json',
        apiKey: apiKey,
      },
    })
      .then((respuesta) =>
        respuesta.ok
          ? respuesta.json()
          : respuesta.json().then((data) => Promise.reject(data.mensaje)),
      )
      .then((data) => crearListadoDeTransacciones(data))
      .catch((mensaje) => {
        display_toast(mensaje, 'Info', 'primary');
      })
      .finally(() => loading.dismiss());
  });
}

function crearListadoDeMonedas(data) {
  let lista = document.getElementById('listado_monedas');
  lista.innerHTML = ''; //limpiar el html par que no duplique las monedas si se recarga la pagina.
  let item = '';
  data.monedas.forEach(function (moneda) {
    item = `<ion-item href="/transaccion?idMoneda=${moneda.id}&&cotizacion=${moneda.cotizacion}" detail>
          <ion-avatar slot="start">
            <img src="${urlBaseImage}${moneda.imagen}" />
          </ion-avatar>
          <ion-label>
            <h2><strong>${moneda.nombre}</strong></h2>
            <h3><strong>Cotización: </strong>${moneda.cotizacion}</h3>
          </ion-label>
        </ion-item>`;
    lista.innerHTML += item;
  });
}

async function crearListadoDeTransacciones(data) {
  let monedas = await obtenerMonedas();
  document.getElementById('id_filtro_moneda').innerHTML = '';
  let lista = document.getElementById('listado_transacciones');
  lista.innerHTML = '';
  let listaMonedasTransaccion = [];
  data.transacciones.forEach(function (transaccion) {
    let nombreMoneda = '';
    let operación = 'Venta';
    if (transaccion.tipo_operacion == 1) {
      operación = 'Compra';
    }

    monedas.forEach((moneda) => {
      if (moneda.id == transaccion.moneda) {
        nombreMoneda = moneda.nombre;

        if (!listaMonedasTransaccion.includes(transaccion.moneda)) {
          listaMonedasTransaccion.push(transaccion.moneda);
          document.getElementById(
            'id_filtro_moneda',
          ).innerHTML += `<ion-select-option value="${transaccion.moneda}">${nombreMoneda}</ion-select-option>`;
        }
      }
    });

    let item = `<ion-row>
              <ion-col> ${nombreMoneda} </ion-col>
              <ion-col> ${operación} </ion-col>
              <ion-col> ${transaccion.cantidad} </ion-col>
              <ion-col> ${transaccion.valor_actual} </ion-col>
            </ion-row>`;
    lista.innerHTML += item;
  });
}

async function crearListadoDeTransaccionesPorMoneda(idMoneda) {
  let monedas = await obtenerMonedas();
  let transacciones = await obtenerTransacciones();

  document.getElementById('id_filtro_moneda').innerHTML = '';
  document.getElementById('listado_transacciones').innerHTML = '';

  let listaMonedasTransaccion = [];

  document.getElementById(
    'id_filtro_moneda',
  ).innerHTML = `<ion-select-option value="-1">Todas</ion-select-option>`;
  transacciones.forEach(function (transaccion) {
    let nombreMoneda = '';
    let operación = 'Venta';
    if (transaccion.tipo_operacion == 1) {
      operación = 'Compra';
    }

    monedas.forEach((moneda) => {
      if (moneda.id == transaccion.moneda) {
        nombreMoneda = moneda.nombre;

        if (!listaMonedasTransaccion.includes(transaccion.moneda)) {
          listaMonedasTransaccion.push(transaccion.moneda);

          document.getElementById(
            'id_filtro_moneda',
          ).innerHTML += `<ion-select-option value="${transaccion.moneda}">${nombreMoneda}</ion-select-option>`;
        }
      }
    });

    if (idMoneda == transaccion.moneda || idMoneda == -1) {
      let item = `<ion-row>
      <ion-col> ${nombreMoneda} </ion-col>
      <ion-col> ${operación} </ion-col>
      <ion-col> ${transaccion.cantidad} </ion-col>
      <ion-col> ${transaccion.valor_actual} </ion-col>
      </ion-row>`;
      document.getElementById('listado_transacciones').innerHTML += item;
    }
  });
}

async function obtenerMonedas() {
  let apiKey = localStorage.getItem('apiKey');
  let url = 'https://crypto.develotion.com/monedas.php';
  let data = await fetch(url, {
    headers: {
      'Content-type': 'application/json',
      apiKey: apiKey,
    },
  })
    .then((respuesta) =>
      respuesta.ok
        ? respuesta.json()
        : respuesta.json().then((data) => Promise.reject(data.mensaje)),
    )
    .then((data) => {
      return data;
    });
  return data.monedas;
}

async function obtenerTransacciones() {
  let apiKey = localStorage.getItem('apiKey');
  let idUsuario = localStorage.getItem('id');
  let url = `https://crypto.develotion.com/transacciones.php?idUsuario=${idUsuario}`;
  let result = await fetch(url, {
    headers: {
      'Content-type': 'application/json',
      apiKey: apiKey,
    },
  })
    .then((respuesta) =>
      respuesta.ok
        ? respuesta.json()
        : respuesta.json().then((data) => Promise.reject(data.mensaje)),
    )
    .then((data) => {
      return data;
    })
    .catch((mensaje) => {
      display_toast(mensaje, 'Info', 'primary');
    });

  return result.transacciones;
}

async function obtenerDepartamentos() {
  let url = 'https://crypto.develotion.com/departamentos.php';

  let result = await fetch(url, {
    headers: {
      'Content-type': 'application/json',
    },
  })
    .then((respuesta) =>
      respuesta.ok
        ? respuesta.json()
        : respuesta.json().then((data) => Promise.reject(data.error)),
    )
    .then((data) => {
      return data.departamentos;
    })
    .catch((mensaje) => display_toast(mensaje, 'Info', 'primary'));
  return result;
}

function montoFinalDeInversiones() {
  cargando('Cargando inversiones totales...').then((loading) => {
    loading.present();
    obtenerTransacciones()
      .then((transacciones) => {
        let compras = 0;
        let ventas = 0;

        transacciones.forEach((it) => {
          if (it.tipo_operacion == 1) {
            let total = it.cantidad * it.valor_actual;
            compras += total;
          } else {
            let total = it.cantidad * it.valor_actual;
            ventas += total;
          }
        });

        let resultado = compras - ventas;
        let inversiones = document.getElementById('id_inversiones');
        if (resultado >= 0) {
          inversiones.innerHTML = `<h1>El total invertido en criptomonedas es: </h1><ion-item color="success" class="ion-text-center">$${resultado}</ion-item>`;
        } else {
          inversiones.innerHTML = `<h1>El total invertido en criptomonedas es: </h1><ion-item color="danger" class="ion-text-center">$${resultado} </ion-item>`;
        }
      })
      .finally(() => loading.dismiss());
  });
}

async function inversionesPorMoneda() {
  document.getElementById('listado_inversiones_moneda').innerHTML = '';

  let transacciones = await obtenerTransacciones();
  let monedas = await obtenerMonedas();

  let listaMonedasTransaccion = [];
  transacciones.forEach((transaccion) => {
    if (!listaMonedasTransaccion.includes(transaccion.moneda)) {
      listaMonedasTransaccion.push(transaccion.moneda);
    }
  });

  listaMonedasTransaccion.forEach((id) => {
    let compras = 0;
    let ventas = 0;

    transacciones.forEach((element) => {
      if (id == element.moneda) {
        if (element.tipo_operacion == 1) {
          compras += element.cantidad * element.valor_actual;
        } else {
          ventas += element.cantidad * element.valor_actual;
        }
      }
    });

    let moneda = monedas.find((element) => id == element.id);

    document.getElementById(
      'listado_inversiones_moneda',
    ).innerHTML += `<ion-item>
        <ion-label>
        <ion-avatar slot="start">
        <img src="${urlBaseImage}${moneda.imagen}" />
        </ion-avatar>
        <h2><strong>${moneda.nombre}</strong></h2>
        <h3><strong>Inversion: </strong>${compras - ventas}</h3>
      </ion-label>
    </ion-item>`;
  });
}

function getUsuarios() {
  cargando('Cargando inversiones totales...').then((loading) => {
    loading.present();
    let apiKey = localStorage.getItem('apiKey');
    let url = 'https://crypto.develotion.com/usuariosPorDepartamento.php';

    fetch(url, {
      headers: {
        'Content-type': 'application/json',
        apiKey: apiKey,
      },
    })
      .then((respuesta) =>
        respuesta.ok
          ? respuesta.json()
          : respuesta.json().then((data) => Promise.reject(data.mensaje)),
      )
      .then((data) => {
        crearMapaUsuarios(data);
      })
      .catch((mensaje) => {
        display_toast(mensaje, 'Info', 'primary');
      })
      .finally(() => loading.dismiss());
  });
}

function crearMapaUsuarios(data) {
  cargando('Cargando inversiones totales...').then((loading) => {
    loading.present();

    obtenerDepartamentos()
      .then((dpto) => {
        let listaDepartamentos = [];
        data.departamentos.forEach((element) => {
          let infoDepartamento = dpto.find((it) => it.id == element.id);
          listaDepartamentos.push({
            latitud: infoDepartamento.latitud,
            longitud: infoDepartamento.longitud,
            cantidad_de_usuarios: element.cantidad_de_usuarios,
            nombre: infoDepartamento.nombre,
          });
          if (map != undefined) {
            map.remove();
          }
          map = L.map('map').setView([-32.3396557, -54.9129103], 6);
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        console.log(listaDepartamentos.length);
        listaDepartamentos.forEach((data) => {
          L.marker([data.latitud, data.longitud])
            .addTo(map)
            .bindPopup(
              `<strong>${data.nombre}</strong><br/>Usuarios registrados: ${data.cantidad_de_usuarios}`,
            );
        });
      })
      .finally(() => loading.dismiss());
  });
}

document.addEventListener('DOMContentLoaded', function () {
  getDepartamentos();
  document
    .getElementById('txtDepartamento')
    .addEventListener('ionChange', (event) => {
      let idDepartamento = event.target.value;
      document.getElementById('txtCiudad').innerHTML = ``;
      getCiudadesByDepartamento(idDepartamento);
    });

  document
    .getElementById('id_filtro_moneda')
    .addEventListener('ionChange', async (event) => {
      let idMoneda = event.target.value;
      crearListadoDeTransaccionesPorMoneda(idMoneda);
    });

  let router = document.querySelector('ion-router');
  router.addEventListener('ionRouteDidChange', function (e) {
    // cerrarMenu();
    document.getElementById('menu_lateral').close();
    let nav = e.detail;
    let paginas = document.getElementsByTagName('ion-page');
    for (let i = 0; i < paginas.length; i++) {
      paginas[i].style.visibility = 'hidden';
    }
    let ion_route = document.querySelectorAll(`[url="${nav.to}"]`);
    let id_pagina = ion_route[0].getAttribute('component');
    let pagina = document.getElementById(id_pagina);
    pagina.style.visibility = 'visible';

    switch (nav.to) {
      case '/monedas':
        getMonedas();
        break;
      case '/transacciones':
        getTransacciones();
        break;
      case '/inversiones':
        montoFinalDeInversiones();
        break;
      case '/inversionesMoneda':
        inversionesPorMoneda();
        break;
      case '/usuariosMapa':
        getUsuarios();
        break;
    }
  });

  document.getElementById('btn_registrar').onclick = function () {
    try {
      let usuario = document.getElementById('inp_usuario').value;
      let password = document.getElementById('inp_password').value;
      let departamento = document.getElementById('txtDepartamento').value;
      let ciudad = document.getElementById('txtCiudad').value;

      if (!usuario) {
        throw 'Nombre de usuario requerido para continuar';
      }
      if (!password) {
        throw 'Contraseña requerida para continuar';
      }
      if (!departamento) {
        throw 'El departamento es requerido para continuar';
      }
      if (!ciudad) {
        throw 'La ciudad es requerida para continuar';
      }

      const url = 'https://crypto.develotion.com/usuarios.php';
      datos = {
        usuario: usuario,
        password: password,
        idDepartamento: departamento,
        idCiudad: ciudad,
      };

      fetch(url, {
        method: 'POST',
        body: JSON.stringify(datos),
        headers: {
          'Content-type': 'application/json',
        },
      })
        .then((respuesta) =>
          respuesta.ok
            ? respuesta.json()
            : respuesta.json().then((data) => Promise.reject(data.mensaje)),
        )
        .then((data) => {
          clearInputs('registro');
          router.push('/');
        })
        .catch((mensaje) => {
          clearInputs('registro');
          display_toast(mensaje, 'Info', 'primary');
        });
    } catch (error) {
      clearInputs('registro');
      display_toast(error, 'Info', 'primary');
    }
  };

  document.getElementById('btn_login').onclick = function () {
    let usuario = document.getElementById('txtUsuario').value;
    let password = document.getElementById('txtContrasenia').value;

    try {
      if (!usuario) {
        throw 'Nombre de usuario requerido para continuar';
      }
      if (!password) {
        throw 'Contraseña requerida para continuar';
      }

      const url = 'https://crypto.develotion.com/login.php';

      fetch(url, {
        method: 'POST',
        body: JSON.stringify({ usuario: usuario, password: password }),
        headers: {
          'Content-type': 'application/json',
        },
      })
        .then((respuesta) =>
          respuesta.ok
            ? respuesta.json()
            : respuesta.json().then((data) => Promise.reject(data.mensaje)),
        )
        .then((data) => {
          clearInputs('login');
          login(data, router);
        })
        .catch((mensaje) => {
          clearInputs('login');
          display_toast(mensaje, 'No autorizado', 'primary');
        });
    } catch (error) {
      clearInputs('login');
      display_toast(error, 'Info', 'primary');
    }
  };

  document.getElementById('btn_transaccion').onclick = function () {
    try {
      var idMoneda = getParam('idMoneda');
      let cotizacion = getParam('cotizacion');
      let cantidad = Number(document.getElementById('txtCantidad').value);
      let tipoOperacion = document.getElementById('txtTipoOperacion').value;

      if (!idMoneda) {
        throw 'No se pudo encontrar la moneda seleccionada';
      }
      if (!cotizacion) {
        throw 'No se pudo encontrar la cotización de la moneda seleccionada';
      }
      if (!cantidad && cantidad > 0) {
        throw 'La cantidad es requerida y debe ser mayor a 0';
      }
      if (!tipoOperacion) {
        throw 'Debe seleccionar un tipo de operación';
      }

      let url = 'https://crypto.develotion.com/transacciones.php';
      let apiKey = localStorage.getItem('apiKey');
      let idUsuario = localStorage.getItem('id');

      let datos = {
        idUsuario: idUsuario,
        tipoOperacion: tipoOperacion,
        moneda: idMoneda,
        cantidad: cantidad,
        valorActual: cotizacion,
      };

      fetch(url, {
        method: 'POST',
        body: JSON.stringify(datos),
        headers: {
          'Content-type': 'application/json',
          apiKey: apiKey,
        },
      })
        .then((respuesta) =>
          respuesta.ok
            ? respuesta.json()
            : respuesta.json().then((data) => Promise.reject(data.mensaje)),
        )
        .then((data) => {
          clearInputs('transaccion');
          display_toast(data.mensaje, 'Info', 'success');
        })
        .catch((mensaje) => {
          clearInputs('transaccion');
          display_toast(mensaje, 'Info', 'primary');
        });
    } catch (error) {
      clearInputs('transaccion');
      display_toast(error, 'Info', 'primary');
    }
  };
});
