//importação das funções úteis de bibliotecas externas
import { addMinutes, getDay } from 'date-fns'; //funções para manipulação de datas
import { CalendarAvailability, CalendarEvent, CalendarSlot } from '../types'; //tipos personalizados para disponibilidade, eventos e slots de calendário

//função para verificar se um slot de tempo está disponível considerando a disponibilidade e eventos já agendados
export const isSlotAvailableWithEvents = (
  availability: CalendarAvailability, //disponibilidade dos slots no calendário
  events: Array<Omit<CalendarEvent, 'buffer'>>, //lista de eventos já agendados (sem o campo 'buffer')
  slot: CalendarSlot, //slot de tempo a ser verificado
): boolean => {

  //obtém o dia da semana do início do slot (0 a 6)
  const slotWeekDay = getDay(slot.start);

  //calcula o horário de término do slot, somando a duração ao horário de início
  const slotEnd = addMinutes(slot.start, slot.durationM);

  //obtém o horário de início e término do slot no formato de horas e minutos em UTC
  const slotStartTime = { hours: slot.start.getUTCHours(), minutes: slot.start.getUTCMinutes() };
  const slotEndTime = { hours: slotEnd.getUTCHours(), minutes: slotEnd.getUTCMinutes() };

  //filtra os dias da semana em que há disponibilidade e confere se o slot está dentro do horário disponível
  const availableForDay = availability.include.filter(a => a.weekday === slotWeekDay);

  //verifica se o slot está dentro do intervalo de disponibilidade do dia
  const isWithAvailability = availableForDay.some(({ range }) => {
    const [start, end] = range; //intervalo de disponibilidade para o dia

    //verifica se o horário de início do slot está dentro do intervalo de disponibilidade
    const isStartInRange =
      slotStartTime.hours > start.hours ||
      (slotStartTime.hours === start.hours && slotStartTime.minutes >= start.minutes);

    //verifica se o horário de término do slot está dentro do intervalo de disponibilidade
    const isEndInRange =
      slotEndTime.hours < end.hours ||
      (slotEndTime.hours === end.hours && slotEndTime.minutes <= end.minutes);

    return isStartInRange && isEndInRange;
  });

  //se o slot não está dentro da disponibilidade do dia, retorna false
  if (!isWithAvailability) {
    return false;
  }

  //verifica se o slot se sobrepõe a algum evento já agendado
  const isOverlapping = events.some(event => {
    const eventStart = event.start;
    const eventEnd = event.end;

    //verifica se o slot se sobrepõe com algum evento
    return (
      (slot.start >= eventStart && slot.start < eventEnd) || //início do slot está dentro do evento
      (slotEnd > eventStart && slotEnd <= eventEnd) || //fim do slot está dentro do evento
      (slot.start <= eventStart && slotEnd >= eventEnd) //slot cobre completamente o evento
    );
  });

  //retorna true se não houver sobreposição com eventos e o slot estiver dentro da disponibilidade
  return !isOverlapping;
};
