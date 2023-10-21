import { html } from 'lit-html'
import formatNumber from '../formatNumber'
import renderInfoItem from './infoItem'
import { wrapSensors } from './templated'

export default function renderSensors({
  _hide,
  entity,
  unit,
  hass,
  sensors,
  config,
  localize,
  openEntityPopover,
}) {
  const {
    state,
    attributes: { hvac_action: action, current_temperature: current },
  } = entity

  const showLabels = config?.layout?.sensors?.labels ?? true
  let stateString = localize(state, 'component.climate.state._.')
  if (action) {
    stateString = [
      localize(action, 'state_attributes.climate.hvac_action.'),
      ` (${stateString})`,
    ].join('')
  }
  const sensorHtml = [
    ...(sensors.map(({ name, state, ...rest }) => {
      return renderInfoItem({
        state,
        hass,
        localize,
        openEntityPopover,
        details: {
          ...rest,
          heading: showLabels && name,
        },
      })
    }) || null),
    renderInfoItem({
      hide: _hide.temperature,
      state: `${formatNumber(current, config)}${unit || ''}`,
      hass,
      localize,
      openEntityPopover,
      details: {
        colorValue: config?.colorValue?.temperature ?? false,
        colorName: config?.colorName?.temperature ?? false,
        heading: showLabels
          ? config?.label?.temperature ?? localize('ui.card.climate.currently')
          : false,
      },
    }),
    renderInfoItem({
      hide: _hide.state,
      state: stateString,
      hass,
      localize,
      openEntityPopover,
      details: {
        colorValue: config?.colorValue?.state ?? false,
        colorName: config?.colorName?.state ?? false,
        heading: showLabels
          ? config?.label?.state ??
            localize('ui.panel.lovelace.editor.card.generic.state')
          : false,
      },
    }),
  ].filter((it) => it !== null)

  return wrapSensors(config, sensorHtml)
}
