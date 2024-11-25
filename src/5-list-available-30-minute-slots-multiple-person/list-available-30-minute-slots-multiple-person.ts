//importação dos tipos personalizados de disponibilidade, evento e slot de calendário
import { CalendarAvailability, CalendarEvent, CalendarSlot } from '../types';

//função que lista todos os slots de 30 minutos disponíveis para múltiplas pessoas
export const listAvailable30MinuteSlotsMultiplePerson = (
  attendees: Array<{
    availability: CalendarAvailability; //disponibilidade do calendário do participante
    events: Array<CalendarEvent>; //lista de eventos do participante
  }>, 
  range: [Date, Date], //intervalo de tempo para gerar os slots
): Array<CalendarSlot> => {
  
  //desestrutura o intervalo para obter o início e o fim
  const [rangeStart, rangeEnd] = range;

  //função que gera todos os slots de 30 minutos no intervalo fornecido
  const generateSlots = (): Array<CalendarSlot> => {
    const slots: Array<CalendarSlot> = [];
    let currentTime = new Date(rangeStart); //começa no início do intervalo

    //gera slots de 30 minutos enquanto o tempo atual for menor que o fim do intervalo
    while (currentTime < rangeEnd) {
      slots.push({
        start: new Date(currentTime), //início do slot
        durationM: 30, //duração do slot (30 minutos)
      });
      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000); //avança 30 minutos
    }

    return slots; //retorna todos os slots gerados
  };

  //função que verifica se um slot específico está disponível para um determinado participante
  const isSlotAvailableForAttendee = (
    slot: CalendarSlot,
    attendee: { availability: CalendarAvailability; events: Array<CalendarEvent> },
  ): boolean => {
    const slotStart = slot.start.getTime(); //horário de início do slot
    const slotEnd = slotStart + slot.durationM * 60 * 1000; //horário de término do slot

    //verifica se o slot está dentro da disponibilidade do participante
    const isWithinAvailability = attendee.availability.include.some(({ weekday, range }) => {
      const slotWeekday = slot.start.getDay(); //obtém o dia da semana do slot
      if (slotWeekday !== weekday) return false; //verifica se o slot é no dia da semana correto

      const [startRange, endRange] = range; //intervalo de disponibilidade
      const availabilityStart = new Date(slot.start);
      availabilityStart.setHours(startRange.hours, startRange.minutes, 0, 0); //início da disponibilidade no horário correto

      const availabilityEnd = new Date(slot.start);
      availabilityEnd.setHours(endRange.hours, endRange.minutes, 0, 0); //fim da disponibilidade no horário correto

      //verifica se o slot está dentro do intervalo de disponibilidade
      return slotStart >= availabilityStart.getTime() && slotEnd <= availabilityEnd.getTime();
    });

    //se o slot não estiver dentro da disponibilidade, retorna falso
    if (!isWithinAvailability) return false;

    //verifica se o slot entra em conflito com eventos agendados do participante
    const hasConflictWithEvents = attendee.events.some(event => {
      const eventStart = event.start.getTime(); //horário de início do evento
      const eventEnd = event.end.getTime(); //horário de término do evento

      //calcula o buffer antes e depois do evento, se houver
      const bufferBefore = (event.buffer?.before || 0) * 60 * 1000; //buffer antes do evento (em milissegundos)
      const bufferAfter = (event.buffer?.after || 0) * 60 * 1000; //buffer depois do evento (em milissegundos)

      //calcula o horário do evento considerando o buffer
      const eventBufferedStart = eventStart - bufferBefore;
      const eventBufferedEnd = eventEnd + bufferAfter;

      //verifica se o slot se sobrepõe ao evento (considerando o buffer)
      return !(slotEnd <= eventBufferedStart || slotStart >= eventBufferedEnd);
    });

    //se não houver conflito com eventos, o slot é disponível para esse participante
    return !hasConflictWithEvents;
  };

  //gera todos os slots de 30 minutos no intervalo fornecido
  const allSlots = generateSlots();

  //filtra os slots disponíveis para todos os participantes
  const availableSlots = allSlots.filter(slot =>
    attendees.every(attendee => isSlotAvailableForAttendee(slot, attendee)), //verifica para todos os participantes
  );

  //retorna a lista de slots disponíveis para todos os participantes
  return availableSlots;
};
