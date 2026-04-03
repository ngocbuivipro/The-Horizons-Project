import {memo, useState, useCallback} from "react";
import {Calendar, momentLocalizer} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {FaChevronLeft, FaChevronRight} from "react-icons/fa";

const localizer = momentLocalizer(moment);

const calendarStyles = `
  .rbc-calendar { font-family: 'Inter', sans-serif; color: #374151; }
  .rbc-month-view { border: 1px solid #f3f4f6; border-radius: 16px; overflow: hidden; background: white; }
  .rbc-header { padding: 12px 0; font-size: 0.75rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; border-bottom: 1px solid #f3f4f6; border-left: none; }
  .rbc-day-bg { background-color: white; border-left: 1px solid #f9fafb; }
  .rbc-today { background-color: #f5f3ff !important; }
  .rbc-date-cell { padding: 4px 8px; font-size: 0.85rem; font-weight: 600; color: #4b5563; }
  /* Adjust font size for date numbers on mobile */
  @media (max-width: 640px) {
    .rbc-date-cell { font-size: 0.75rem; padding: 2px; }
    .rbc-header { font-size: 0.65rem; padding: 8px 0; }
  }
  .rbc-off-range-bg { background-color: #f9fafb; }
  .rbc-event { background-color: transparent; border: none; padding: 0; outline: none; min-height: auto !important; }
  .rbc-event:focus { outline: none; }
  .rbc-month-row { border-top: 1px solid #f3f4f6; }
  .rbc-day-bg:hover { background-color: #fafafa; transition: background-color 0.2s; }
  .rbc-day-bg.rbc-past-day { background-color: #f8f9fa; opacity: 0.6; cursor: not-allowed; }
`;

// Helper for formatting currency consistently
const formatPrice = (value) =>
    typeof value === 'number' ? new Intl.NumberFormat("vi-VN").format(value) : value;

// --- MOBILE BOTTOM SHEET COMPONENT ---
// This handles the "Show Detail" requirement without cluttering the small calendar cells
const EventDetailModal = ({event, onClose}) => {
    if (!event) return null;

    // Determine styling based on event type (mirroring CustomEvent logic)
    let statusColor = "text-green-600 bg-green-50 border-green-200";
    let statusLabel = "Available";

    if (event.isBlocked) {
        statusColor = "text-red-600 bg-red-50 border-red-200";
        statusLabel = "Unavailable / Closed";
    } else if (event.type === 'PRICE_OVERRIDE') {
        statusColor = "text-indigo-600 bg-indigo-50 border-indigo-200";
        statusLabel = "Special Price";
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={onClose}>
            <div
                className="w-full sm:w-[400px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom-10 fade-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">
                            {moment(event.start).format('dddd, DD MMMM YYYY')}
                        </h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
                            {statusLabel}
                        </span>
                    </div>
                    <button onClick={onClose}
                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 font-bold text-sm">
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Price per night</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatPrice(event.title)} <span className="text-sm text-gray-400 font-normal">VND</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CustomToolbar = (toolbar) => {
    const goToBack = () => toolbar.onNavigate('PREV');
    const goToNext = () => toolbar.onNavigate('NEXT');
    const goToCurrent = () => toolbar.onNavigate('TODAY');

    const label = () => {
        const date = moment(toolbar.date);
        return (
            <span className="text-base sm:text-lg font-bold text-gray-800 capitalize">
                {date.format('MMMM')} <span className="text-gray-400">{date.format('YYYY')}</span>
            </span>
        );
    };

    return (
        <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex items-center gap-2 sm:gap-4">{label()}</div>
            <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                <button onClick={goToBack}
                        className="p-2 hover:bg-white rounded-md text-gray-500 transition-all shadow-sm"><FaChevronLeft
                    size={10}/></button>
                <button onClick={goToCurrent}
                        className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-white rounded-md transition-all shadow-sm">Today
                </button>
                <button onClick={goToNext}
                        className="p-2 hover:bg-white rounded-md text-gray-500 transition-all shadow-sm"><FaChevronRight
                    size={10}/></button>
            </div>
        </div>
    );
};

// --- RESPONSIVE CUSTOM EVENT ---
// Uses CSS classes to radically simplify the view on mobile (hidden sm:block)
const CustomEvent = memo(({event}) => {
    const isPast = moment(event.start).isBefore(moment(), 'day');
    const baseClasses = "mx-0.5 mt-0.5 p-1 rounded-sm shadow-sm transition-all cursor-pointer h-full flex flex-col justify-center";

    // Mobile: Text is extremely small, Desktop: Standard size
    const textClasses = "text-[9px] sm:text-[11px] font-bold leading-tight truncate text-center sm:text-left";
    const priceFormatted = formatPrice(event.title);

    // Render Logic
    if (event.isBlocked) {
        return (
            <div className={`${baseClasses} bg-red-50 border-l-2 border-red-500`}>
                <div className="hidden sm:block text-[9px] text-red-500 font-semibold leading-none mb-0.5">Unavailable
                </div>
                {/* Mobile View: Just show "Closed" or Icon */}
                <div className={`${textClasses} text-red-700`}>
                    <span className="sm:hidden">✕</span>
                    <span className="hidden sm:inline">Closed</span>
                </div>
            </div>
        );
    }

    if (isPast) {
        return (
            <div className={`${baseClasses} bg-gray-100 border-l-2 border-gray-300 opacity-50`}>
                <div className={`${textClasses} text-gray-500`}>{priceFormatted}</div>
            </div>
        );
    }

    // Special Price
    if (event.type === 'PRICE_OVERRIDE') {
        return (
            <div className={`${baseClasses} bg-indigo-50 border-l-2 border-indigo-500 shadow-sm`}>
                <div className="hidden sm:block text-[9px] text-indigo-600 font-semibold leading-none mb-0.5">Special
                </div>
                <div className={`${textClasses} text-indigo-800`}>{priceFormatted}</div>
            </div>
        );
    }

    // Default
    return (
        <div className={`${baseClasses} bg-green-50 border-l-2 border-green-500`}>
            <div className="hidden sm:block text-[9px] text-green-600 font-semibold leading-none mb-0.5">Default</div>
            <div className={`${textClasses} text-green-800`}>{priceFormatted}</div>
        </div>
    );
});

// --- MAIN COMPONENT ---
const AdminCalendar = ({events, style}) => {
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Disable past days
    const dayPropGetter = useCallback((date) => {
        if (moment(date).isBefore(moment(), 'day')) {
            return {className: 'rbc-past-day', style: {cursor: 'default'}};
        }
        // Add active touch feedback style for mobile
        return {className: 'active:bg-gray-50 transition-colors'};
    }, []);

    // Handle interaction (Tap on mobile, Click on desktop)
    const handleSelectEvent = useCallback((event) => {
        // Prevent interaction with past events if strictly required, otherwise allow viewing past data
        setSelectedEvent(event);
    }, []);

    return (
        <>
            <style>{calendarStyles}</style>

            {/* Calendar Container */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-2 sm:p-4">
                <div style={{height: "500px", ...style}}>
                    <Calendar
                        selectable={true}
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        defaultView="month"
                        views={["month"]}
                        style={{height: "100%", width: "100%"}}
                        dayPropGetter={dayPropGetter}
                        // This triggers the modal/bottom sheet
                        onSelectEvent={handleSelectEvent}
                        // Long press logic is unstable in this lib, onSelectEvent is the robust mobile standard
                        components={{
                            toolbar: CustomToolbar,
                            event: CustomEvent,
                        }}
                    />
                </div>
            </div>

            {/* Render Modal/Bottom Sheet outside the calendar flow */}
            <EventDetailModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
            />
        </>
    );
};

export default AdminCalendar;