import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
} from 'react';
import {
  first,
  last,
  sortedIndex,
  range,
  isNumber,
} from 'lodash';
import { scaleTime } from 'd3-scale';
import moment from 'moment';

import { __ } from '../helpers/translation';
import TimeAxis from './graph/timeaxis';

const AXIS_HORIZONTAL_MARGINS = 12;

const getTimeScale = (containerWidth, datetimes, startTime, endTime) => scaleTime()
  .domain([
    startTime ? moment(startTime).toDate() : first(datetimes),
    endTime ? moment(endTime).toDate() : last(datetimes),
  ])
  .range([0, containerWidth]);

const createChangeAndInputHandler = (datetimes, onChange, setAnchoredTimeIndex) => (ev) => {
  const value = parseInt(ev.target.value, 10);
  let index = sortedIndex(datetimes.map(t => t.valueOf()), value);
  // If the slider is past the last datetime, we set index to null in order to use the scale end time.
  if (index >= datetimes.length) {
    index = null;
  }
  setAnchoredTimeIndex(index);
  if (onChange) {
    onChange(index);
  }
};

const TimeSlider = ({
  className,
  onChange,
  selectedTimeIndex,
  datetimes,
  startTime,
  endTime,
}) => {
  const ref = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [anchoredTimeIndex, setAnchoredTimeIndex] = useState(null);

  // Container resize hook
  useEffect(() => {
    const updateContainerWidth = () => {
      if (ref.current) {
        setContainerWidth(ref.current.getBoundingClientRect().width - 2 * AXIS_HORIZONTAL_MARGINS);
      }
    };
    // Initialize width if it's not set yet
    if (!containerWidth) {
      updateContainerWidth();
    }
    // Update container width on every resize
    window.addEventListener('resize', updateContainerWidth);
    return () => {
      window.removeEventListener('resize', updateContainerWidth);
    };
  });

  const timeScale = useMemo(
    () => getTimeScale(containerWidth, datetimes, startTime, endTime),
    [containerWidth, datetimes, startTime, endTime]
  );

  const handleChangeAndInput = useMemo(
    () => createChangeAndInputHandler(datetimes, onChange, setAnchoredTimeIndex),
    [datetimes, onChange, setAnchoredTimeIndex]
  );

  if (!datetimes || datetimes.length === 0) return null;

  const selectedTimeValue = isNumber(selectedTimeIndex) ? datetimes[selectedTimeIndex].valueOf() : null;
  const anchoredTimeValue = isNumber(anchoredTimeIndex) ? datetimes[anchoredTimeIndex].valueOf() : null;
  const startTimeValue = timeScale.domain()[0].valueOf();
  const endTimeValue = timeScale.domain()[1].valueOf();

  return (
    <div className={className}>
      <input
        type="range"
        className="time-slider-input"
        onChange={handleChangeAndInput}
        onInput={handleChangeAndInput}
        value={selectedTimeValue || anchoredTimeValue || endTimeValue}
        min={startTimeValue}
        max={endTimeValue}
      />
      <svg className="time-slider-axis-container" ref={ref}>
        <TimeAxis
          scale={timeScale}
          transform={`translate(${AXIS_HORIZONTAL_MARGINS}, 0)`}
          className="time-slider-axis"
        />
      </svg>
    </div>
  );
};

export default TimeSlider;
