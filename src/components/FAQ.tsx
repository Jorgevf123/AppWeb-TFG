
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: "¿Qué documentación necesito para que mi mascota viaje?",
    answer: "Para viajar, tu mascota necesitará su cartilla sanitaria al día, microchip, y dependiendo del destino, puede requerir un pasaporte para mascotas y certificados adicionales. El acompañante te informará de todos los requisitos específicos para tu viaje."
  },
  /*{
    question: "¿Cómo se seleccionan los acompañantes?",
    answer: "Todos nuestros acompañantes pasan por un riguroso proceso de selección que incluye verificación de antecedentes, entrevistas personales, pruebas de conocimiento sobre cuidado animal y un período de formación específica para el transporte de mascotas."
  },*/
  {
    question: "¿Qué ocurre si hay retrasos o cancelaciones?",
    answer: "En caso de retrasos, nuestro acompañante permanecerá con tu mascota y te mantendrá informado en todo momento. Si hay cancelaciones, te ayudaremos a reprogramar el viaje sin coste adicional o te ofreceremos un reembolso según nuestra política."
  },
  {
    question: "¿Puedo seguir el viaje de mi mascota en tiempo real?",
    answer: "Sí, a través de nuestra aplicación podrás seguir la ubicación de tu mascota en tiempo real durante todo el trayecto gracias al chat con el acompañante. Además, recibirás actualizaciones periódicas con fotos y mensajes."
  },
  {
    question: "¿Qué tipo de mascotas pueden utilizar este servicio?",
    answer: "El servicio está disponible principalmente para perros y gatos, aunque también podemos transportar pequeños mamíferos como conejos o hurones. Para mascotas más exóticas, contáctanos para evaluar cada caso particular."
  },
  {
    question: "¿Cómo se garantiza el bienestar de mi mascota durante el viaje?",
    answer: "Los acompañantes estarán atentos en todo momento para reconocer signos de estrés o incomodidad en los animales. En ese caso hablarán de inmediato con el personal del avión/tren."
  }
];

const FAQ = () => {
  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-petblue mb-4">Preguntas Frecuentes</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Respondemos a tus dudas sobre nuestro servicio de acompañamiento para mascotas
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {Array.isArray(faqs) && faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-montserrat font-semibold text-petblue-dark">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">¿No encuentras respuesta a tu pregunta?</p>
          <div className="inline-block bg-petgreen/20 text-petblue-dark font-medium px-4 py-3 rounded-lg">
            Contacta con nuestro equipo en <a href="mailto:pettravelbuddy.notif@gmail.com" className="text-petblue font-bold underline">pettravelbuddy.notif@gmail.com</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
