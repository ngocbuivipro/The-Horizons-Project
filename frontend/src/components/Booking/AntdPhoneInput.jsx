import React, { useState, useEffect, useMemo, memo } from 'react'; // Thêm useMemo, memo
import { Input, Select, ConfigProvider } from 'antd';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input/input';
import en from 'react-phone-number-input/locale/en';
import parsePhoneNumber from 'libphonenumber-js';
import Flags from 'country-flag-icons/react/3x2';
import { FaChevronDown } from "react-icons/fa";

const { Option } = Select;

const AntdPhoneInput = ({ value, onChange, className }) => {
    const [country, setCountry] = useState('VN');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (value) {
            try {
                const parsed = parsePhoneNumber(value);
                if (parsed) {
                    setCountry(parsed.country || 'VN');
                    setPhoneNumber(parsed.nationalNumber);
                }
            } catch (e) {
                setPhoneNumber(value);
            }
        }
    }, [value]);

    const triggerChange = (selectedCountry, number) => {
        if (!number) {
            onChange?.('');
            return;
        }
        try {
            const callingCode = getCountryCallingCode(selectedCountry);
            const fullNumber = `+${callingCode}${number}`;
            onChange?.(fullNumber);
        } catch (error) {
            onChange?.(number);
        }
    };

    const onCountryChange = (newCountry) => {
        setCountry(newCountry);
        triggerChange(newCountry, phoneNumber);
    };

    const onPhoneNumberChange = (e) => {
        const newNumber = e.target.value;
        setPhoneNumber(newNumber);
        triggerChange(country, newNumber);
    };

    const filterOption = (input, option) => {
        const searchStr = (option?.searchData || '').toLowerCase();
        const inputStr = input.toLowerCase();
        return searchStr.includes(inputStr);
    };

    // --- OPTIMIZATION 1: useMemo ---
    // Chỉ tính toán danh sách quốc gia 1 lần duy nhất.
    // React sẽ không phải chạy map() lại 250 lần mỗi khi bạn gõ phím.
    const countryOptions = useMemo(() => {
        return getCountries().map((countryCode) => (
            <Option
                key={countryCode}
                value={countryCode}
                searchData={`${en[countryCode]} ${countryCode} +${getCountryCallingCode(countryCode)}`}
                label={
                    <div className="flex items-center gap-2 h-full">
                        <div className="w-5 h-5 flex-shrink-0 flex items-center">
                            {Flags[countryCode] && React.createElement(Flags[countryCode], { className: "w-5 h-3.5 rounded-[2px] shadow-sm object-cover" })}
                        </div>
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[80px]">
                            {en[countryCode]}
                        </span>
                    </div>
                }
            >
                <div className="flex items-center gap-3 py-1">
                    <div className="w-6 flex-shrink-0">
                        {Flags[countryCode] && React.createElement(Flags[countryCode], { className: "w-6 h-4 rounded-[2px] shadow-sm" })}
                    </div>
                    <div className="flex flex-col leading-tight overflow-hidden">
                        <span className="text-gray-700 text-sm font-medium truncate">{en[countryCode]}</span>
                        <span className="text-xs text-gray-400">{countryCode}</span>
                    </div>
                    <span className="ml-auto text-orange-600 text-sm font-bold">+{getCountryCallingCode(countryCode)}</span>
                </div>
            </Option>
        ));
    }, []); // Dependency array rỗng -> Chỉ chạy 1 lần khi mount

    return (
        <ConfigProvider
            theme={{
                components: {
                    Input: {
                        activeBorderColor: 'transparent',
                        hoverBorderColor: 'transparent'
                    },
                    Select: {
                        selectorBg: 'transparent',
                        colorBorder: 'transparent',
                        colorPrimaryHover: 'transparent',
                        controlOutline: 'transparent',
                    }
                },
            }}
        >
            <div
                className={`
            flex items-center h-[50px] bg-white rounded-lg transition-all duration-200 ease-in-out
            border overflow-hidden relative
            ${isFocused
                    ? 'border-orange-500 ring-2 ring-orange-500/20'
                    : 'border-gray-300 hover:border-orange-400'
                }
            ${className} 
        `}
            >
                <div className="relative h-full flex items-center bg-gray-50 border-r border-gray-200 hover:bg-gray-100 transition-colors min-w-[140px]">
                    <Select
                        showSearch
                        value={country}
                        onChange={onCountryChange}
                        variant="borderless"
                        popupMatchSelectWidth={320}
                        className="w-full h-full custom-select-flag"
                        suffixIcon={<FaChevronDown className="text-gray-400 text-[10px]" />}
                        optionLabelProp="label"
                        filterOption={filterOption}
                        optionFilterProp="children"
                    >
                        {/* Thay vì map trực tiếp, ta dùng biến đã cached */}
                        {countryOptions}
                    </Select>
                </div>

                <div className="text-gray-500 font-semibold text-sm pointer-events-none pl-3 pr-1 select-none whitespace-nowrap">
                    +{getCountryCallingCode(country)}
                </div>

                <Input
                    value={phoneNumber}
                    onChange={onPhoneNumberChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Number"
                    variant="borderless"
                    className="flex-1 h-full text-base font-medium text-gray-700 placeholder-gray-400 px-2 bg-transparent"
                    style={{ boxShadow: 'none' }}
                />
            </div>

            <style>{`
        .custom-select-flag .ant-select-selector {
            padding-left: 12px !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
        }
        .custom-select-flag .ant-select-selection-item {
            display: flex !important;
            align-items: center !important;
        }
        .custom-select-flag .ant-select-selection-search {
            inset-inline-start: 12px !important;
        }
      `}</style>
        </ConfigProvider>
    );
};
export default AntdPhoneInput;