const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function enviarEmailNotificacionSolicitud(destinatario, mensaje) {
  await transporter.sendMail({
    from: `"PetTravelBuddy" <${process.env.EMAIL_FROM}>`,
    to: destinatario,
    subject: "Actualización sobre tu solicitud",
    text: mensaje,
    html: `<p>${mensaje}</p>`
  });
}

async function enviarEmailNotificacionChat(destinatario, mensaje) {
  await transporter.sendMail({
    from: `"PetTravelBuddy" <${process.env.EMAIL_FROM}>`,
    to: destinatario,
    subject: "Nuevo mensaje en el chat",
    text: mensaje,
    html: `<p>${mensaje}</p>`
  });
}

module.exports = {
  enviarEmailNotificacionSolicitud,
  enviarEmailNotificacionChat
};
