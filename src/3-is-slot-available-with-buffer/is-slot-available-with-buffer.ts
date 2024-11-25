//importação dos tipos personalizados de disponibilidade, evento e slot de calendário
import { CalendarAvailability, CalendarEvent, CalendarSlot } from '../types';

//função que verifica se um slot de tempo está disponível considerando a disponibilidade e eventos com buffer
export const isSlotAvailableWithBuffer = (
  availability: CalendarAvailability, //disponibilidade do calendário
  events: Array<CalendarEvent>, //lista de eventos já agendados
  slot: CalendarSlot, //slot de tempo a ser verificado
): boolean => {
  
  //calcula o horário de início e término do slot em milissegundos
  const slotStart = slot.start.getTime();
  const slotEnd = slot.start.getTime() + slot.durationM * 60 * 1000;

  //função que verifica se o slot está dentro da disponibilidade do dia
  const isWithAvailability = (): boolean => {
    const slotDay = slot.start.getDay(); //obtém o dia da semana do slot (0 a 6)
    
    //encontra a disponibilidade para o dia do slot
    const dayAvailability = availability.include.find((a) => a.weekday === slotDay);

    //se não houver disponibilidade para o dia, retorna falso
    if (!dayAvailability) {
      return false;
    }

    //obtém o intervalo de horário de disponibilidade para o dia
    const [startRange, endRange] = dayAvailability.range;

    //cria novos objetos Date para o início e fim da disponibilidade no mesmo dia do slot
    const avaibilityStart = new Date(slot.start);
    avaibilityStart.setHours(startRange.hours, startRange.minutes, 0, 0);
    
    const avaibilityEnd = new Date(slot.start);
    avaibilityEnd.setHours(endRange.hours, endRange.minutes, 0, 0);

    //verifica se o slot está dentro do intervalo de disponibilidade
    return slotStart >= avaibilityStart.getTime() && slotEnd <= avaibilityEnd.getTime();
  }

  //função que verifica se o slot entra em conflito com algum evento, considerando o buffer
  const hasConflictWithEvents = (): boolean => {
    return events.some(event => {
      const eventStart = event.start.getTime(); //horário de início do evento em milissegundos
      const eventEnd = event.end.getTime(); //horário de término do evento em milissegundos

      //obtém os buffers antes e depois do evento (em milissegundos)
      const bufferBefore = (event.buffer?.before || 0) * 30 * 60 * 1000; //buffer antes do evento (em milissegundos)
      const bufferAfter = (event.buffer?.after || 0) * 60 * 1000; //buffer depois do evento (em milissegundos)

      //calcula o horário de início e término do evento com o buffer aplicado
      const eventBufferedStart = eventStart - bufferBefore;
      const eventBufferedEnd = eventEnd + bufferAfter;

      //verifica se o slot se sobrepõe com o evento considerando o buffer
      return !(slotEnd <= eventBufferedStart || slotStart >= eventBufferedEnd);
    });
  };

  //verifica se o slot está dentro da disponibilidade e não entra em conflito com eventos
  return isWithAvailability() && !hasConflictWithEvents();
};
