//importação de funções úteis de bibliotecas externas
import { CalendarAvailability, CalendarSlot } from '../types'; //tipos personalizados para disponibilidade e intervalos de calendário
import { getDay, addMinutes } from 'date-fns'; //funções de data da biblioteca 'date-fns'

//função para verificar se um determinado slot de horário está disponível
export const isSlotAvailable = (availability: CalendarAvailability, slot: CalendarSlot): boolean => {
  
  //obtm o numero do dia da semana (0 a 6) para o inicio do slot
  const DayWeekslot = getDay(slot.start);

  //calcula o horário de término do slot somando a duração ao inicio do slot
  const slotEnd = addMinutes(slot.start, slot.durationM);
  
  //obtém o horario de inicio e termino do slot no formato de horas e minutos utc
  const slotStartTime = { hours: slot.start.getUTCHours(), minutes: slot.start.getUTCMinutes() };
  const slotEndTime = { hours: slotEnd.getUTCHours(), minutes: slotEnd.getUTCMinutes() };

  //filtra os dias da semana em que ha disponibilidade, com base no dia do slot
  const availableForDay = availability.include.filter(a => a.weekday === DayWeekslot);

  //verifica se o intervalo do slot está dentro de algum dos intervalos de disponibilidade
  return availableForDay.some(({ range }) => {
    const [start, end] = range; //obtém o intervalo de tempo de disponibilidade para o dia

    //verifica se a hora de início do slot está dentro do intervalo de disponibilidade
    const isStartInRange =
      slotStartTime.hours > start.hours || 
      (slotStartTime.hours === start.hours && slotStartTime.minutes >= start.minutes);

    //verifica se a hora de término do slot está dentro do intervalo de disponibilidade
    const isEndInRange =
      slotEndTime.hours < end.hours || 
      (slotEndTime.hours === end.hours && slotEndTime.minutes <= end.minutes);

    //retorna verdadeiro se o início e o fim do slot estiverem dentro do intervalo de disponibilidade
    return isStartInRange && isEndInRange;
  });
};
