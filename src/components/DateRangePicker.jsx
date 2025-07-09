import React, { useState, useCallback, useEffect } from "react";
import { Button, Popover, Box, InlineStack, TextField, OptionList, DatePicker, Scrollable, Icon, useBreakpoints, BlockStack } from "@shopify/polaris";
import moment from "moment";
import { ArrowRightIcon, CalendarIcon } from "@shopify/polaris-icons";

const DateRangePicker = ({ onDateRangeSelect, value: { start, end } }) => {
  const { mdDown } = useBreakpoints();
  const [popoverActive, setPopoverActive] = useState(false);
  const [startDateInput, setStartDateInput] = useState(start ? moment(start).format("DD MMM YYYY") : moment().subtract(1, 'day').format("DD MMM YYYY"));
  const [endDateInput, setEndDateInput] = useState(end ? moment(end).format("DD MMM YYYY") : moment().subtract(1, 'day').format("DD MMM YYYY"));

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const ranges = [
    { title: "Today", period: { since: today, until: today } },
    { title: "Yesterday", period: { since: yesterday, until: yesterday } },
    {
      title: "Last 7 days",
      period: {
        since: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), 
        until: today,
      },
    },
    {
      title: "Last 30 days",
      period: {
        since: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), 
        until: today,
      },
    },
    {
      title: "Last 90 days",
      period: {
        since: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
        until: today,
      },
    },
    {
      title: "Last 1 year",
      period: {
        since: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()), 
        until: today,
      },
    },
    {
      title: "Custom",
      period: { since: start || yesterday, until: end || yesterday },
    },
  ];

  const getInitialDateRange = () => {
    const areDatesEqual = (dateX, dateY) =>
      dateX.toDateString() === dateY.toDateString();
    if (start && end) {
      const foundRange = ranges.find(
        (range) =>
          areDatesEqual(range.period.since, start) &&
          areDatesEqual(range.period.until, end)
      );
      return (
        foundRange || { title: "Custom", period: { since: start, until: end } }
      );
    }
    return ranges[0];
  };

  const defaultRange = getInitialDateRange();
  const [activeDateRange, setActiveDateRange] = useState(defaultRange);
  const [dateState, setDateState] = useState({
    month: activeDateRange.period.since.getMonth(),
    year: activeDateRange.period.since.getFullYear(),
  });

  const handleMonthChange = useCallback((month, year) => {
    setDateState({ month, year });
  }, []);

  const formatDate = (date) => moment(date).format("DD MMM YYYY");

  useEffect(() => {
    setDateState({
      month: activeDateRange.period.since.getMonth(),
      year: activeDateRange.period.since.getFullYear(),
    });
  }, [activeDateRange]);

  const handleRangeSelection = (selected) => {
    if (Array.isArray(selected)) {
      const selectedRange = ranges.find((range) => range.title === selected[0]);
      if (selectedRange) {
        setActiveDateRange(selectedRange);
        setStartDateInput(formatDate(selectedRange.period.since));
        setEndDateInput(formatDate(selectedRange.period.until));
      }
    }
  };

  const handleDateChange = ({ start, end }) => {
    if (start && end) {
      setActiveDateRange({
        title: `${formatDate(start)} - ${formatDate(end)}`,
        period: { since: start, until: end },
      });
      setStartDateInput(formatDate(start));
      setEndDateInput(formatDate(end));
    }
  };

  const handleDateInputChange = (value, isStartDate) => {
    const date = moment(value, "DD MMM YYYY").toDate();
    if (isStartDate) {
      setStartDateInput(value);
      setActiveDateRange((prev) => ({
        ...prev,
        period: { ...prev.period, since: date },
      }));
    } else {
      setEndDateInput(value);
      setActiveDateRange((prev) => ({
        ...prev,
        period: { ...prev.period, until: date },
      }));
    }
  };

  const getButtonLabel = () => {
    if (
      activeDateRange.period.since.toDateString() === activeDateRange.period.until.toDateString()
    ) {
      return `${formatDate(activeDateRange.period.since)}`;
    }
    return `${formatDate(activeDateRange.period.since)} - ${formatDate(
      activeDateRange.period.until
    )}`;
  };
  
  return (
    <Box>
      <Popover
        active={popoverActive}
        autofocusTarget="none"
        preferredAlignment="right"
        preferredPosition="below"
        fluidContent
        sectioned={false}
        fullHeight
        activator={
          <Button
            icon={CalendarIcon}
            size="slim"
            onClick={() => setPopoverActive(!popoverActive)}
          >
            Date Filter : {getButtonLabel()}
          </Button>
        }
        onClose={() => setPopoverActive(false)}
      >
        <Box style={{ padding: "16px 10px" }}>
          <Popover.Pane fixed>
            <InlineStack
              columns={{
                xs: "1fr",
                mdDown: "1fr",
                md: "max-content max-content",
              }}
              gap={0}
            >
              <Box
                maxWidth="212px"
                width="100%"
                style={{ paddingRight: "20px" }}
              >
                <Scrollable style={{ height: "auto" }}>
                  <OptionList
                    options={ranges.map((range) => ({
                      value: range.title,
                      label: (
                        <div style={{ minWidth: "120px" }}>{range.title}</div>
                      ),
                    }))}
                    selected={[activeDateRange.title]} 
                    onChange={handleRangeSelection}
                  />
                </Scrollable>
              </Box>
              <Box maxWidth="516px">
                <BlockStack gap="400">
                  <InlineStack gap="200">
                    <div style={{ flexGrow: 1 }}>
                      <TextField
                        label="Since"
                        role="combobox"
                        value={startDateInput}
                        onChange={(value) => handleDateInputChange(value, true)}
                        autoComplete="off"
                      />
                    </div>
                    {!mdDown && (
                      <Box style={{ marginTop: "5%" }}>
                        <Icon source={ArrowRightIcon} tone="subdued" />
                      </Box>
                    )}
                    <div style={{ flexGrow: 1 }}>
                      <TextField
                        label="Until"
                        role="combobox"
                        value={endDateInput}
                        onChange={(value) => handleDateInputChange(value, false)}
                        autoComplete="off"
                      />
                    </div>
                  </InlineStack>
                  <div style={{ height: "256px" }}>
                    <DatePicker
                      month={dateState.month}
                      year={dateState.year}
                      selected={{
                        start: activeDateRange.period.since,
                        end: activeDateRange.period.until,
                      }}
                      onChange={handleDateChange}
                      onMonthChange={handleMonthChange}
                      multiMonth={!mdDown}
                      allowRange
                      disableDatesAfter={today} 
                    />
                  </div>
                </BlockStack>
              </Box>
            </InlineStack>
          </Popover.Pane>
          <Popover.Pane fixed>
            <Popover.Section>
              <InlineStack align="end" gap="200">
                <Button
                  onClick={() => {
                    setActiveDateRange(getInitialDateRange());
                    setPopoverActive(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    onDateRangeSelect({
                      start: activeDateRange.period.since,
                      end: activeDateRange.period.until,
                    });
                    setPopoverActive(false);
                  }}
                >
                  Apply
                </Button>
              </InlineStack>
            </Popover.Section>
          </Popover.Pane>
        </Box>
      </Popover>
    </Box>
  );
};



export default DateRangePicker;
