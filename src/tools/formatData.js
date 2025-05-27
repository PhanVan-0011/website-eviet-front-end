import moment from 'moment';
export const formatDate = (date, format = 'DD/MM/YYYY') => {
    if (!date) return '';
    return moment(date).format(format);
};
