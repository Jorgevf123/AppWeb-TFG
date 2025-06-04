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
async function enviarEmailBaneo(destinatario, minutos) {
  await transporter.sendMail({
    from: `"PetTravelBuddy" <${process.env.EMAIL_FROM}>`,
    to: destinatario,
    subject: "Has sido baneado temporalmente",
    html: `
      <p>Hola,</p>
      <p>Has sido <strong>baneado temporalmente</strong> de PetTravelBuddy.</p>
      <p>Duración: <strong>${minutos} minutos</strong>.</p>
      <p>No podrás acceder a la plataforma durante este tiempo.</p>
      <br/>
      <p>Si crees que esto es un error, contacta con soporte.</p>
    `
  });
}
async function enviarEmailDesbaneo(destinatario) {
  await transporter.sendMail({
    from: `"PetTravelBuddy" <${process.env.EMAIL_FROM}>`,
    to: destinatario,
    subject: "Tu baneo ha finalizado",
    html: `
      <p>Hola,</p>
      <p>Tu baneo ha finalizado y ya puedes volver a usar PetTravelBuddy.</p>
      <p>Te recomendamos seguir las normas para evitar futuros bloqueos.</p>
      <br/>
      <p>Un saludo,<br/>El equipo de PetTravelBuddy</p>
    `
  });
}
async function enviarEmailRecuperacion(destinatario, link) {
  const mailOptions = {
    from: `"PetTravelBuddy" <${process.env.EMAIL_FROM}>`,
    to: destinatario,
    subject: "Recuperación de contraseña",
    html: `
      <p>Has solicitado cambiar tu contraseña.</p>
      <p><a href="${link}">Haz clic aquí para establecer una nueva contraseña</a></p>
      <p>Este enlace expirará en 15 minutos.</p>
    `,
  };

  return transporter.sendMail(mailOptions); // Usa el transporter común
}

module.exports = {
  enviarEmailRecuperacion,
  enviarEmailNotificacionSolicitud,
  enviarEmailNotificacionChat,
  enviarEmailBaneo,
  enviarEmailDesbaneo 
};
