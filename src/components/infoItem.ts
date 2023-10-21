import { html } from 'lit-html'
import formatNumber from '../formatNumber'
import { LooseObject } from '../types'

interface InfoItemDetails extends LooseObject {
  heading?: string | false
  icon?: string
  unit?: string
  decimals?: number
  type?: string
  colorValue?: boolean | false
  colorName?: boolean | false
}

interface InfoItemOptions {
  hide?: boolean
  state: any
  hass: any
  localize?
  openEntityPopover?
  details: InfoItemDetails
}

// Preset mode can be  one of: none, eco, away, boost, comfort, home, sleep, activity
// See https://github.com/home-assistant/home-assistant/blob/dev/homeassistant/components/climate/const.py#L36-L57

export default function renderInfoItem({
  hide = false,
  hass,
  state,
  details,
  localize,
  openEntityPopover,
}: InfoItemOptions) {
  if (hide || typeof state === 'undefined') return

  const { type, heading, icon, unit, decimals, colorValue, colorName } = details

  let _colorValue = false
  let _colorName = false

  // apply color to value
  if (typeof colorValue === 'boolean') {
    _colorValue = colorValue
  }

  // apply color to label
  if (typeof colorName === 'boolean') {
    _colorName = colorName
  }

  let valueCell
  if (process.env.DEBUG) {
    console.log('ST: infoItem', { state, details })
  }

  if (type === 'relativetime') {
    if (_colorValue) {
      valueCell = html`
        <div class="sensor-value2">
          <ha-relative-time .datetime=${state} .hass=${hass}></ha-relative-time>
        </div>
      `
    } else {
      valueCell = html`
        <div class="sensor-value">
          <ha-relative-time .datetime=${state} .hass=${hass}></ha-relative-time>
        </div>
      `
    }
  } else if (typeof state === 'object') {
    const [domain] = state.entity_id.split('.')
    const prefix = [
      'component',
      domain,
      'state',
      state.attributes?.device_class ?? '_',
      '',
    ].join('.')
    let value = localize(state.state, prefix)
    if (typeof decimals === 'number') {
      value = formatNumber(value, { decimals })
    }

    if (_colorValue) {
      valueCell = html`
        <div
          class="sensor-value2 clickable"
          @click="${() => openEntityPopover(state.entity_id)}"
        >
          ${value} ${unit || state.attributes.unit_of_measurement}
        </div>
      `
    } else {
      valueCell = html`
        <div
          class="sensor-value clickable"
          @click="${() => openEntityPopover(state.entity_id)}"
        >
          ${value} ${unit || state.attributes.unit_of_measurement}
        </div>
      `
    }
  } else {
    let value =
      typeof decimals === 'number' ? formatNumber(state, { decimals }) : state
    if (_colorValue) {
      valueCell = html`
        <div
          class="sensor-value2 clickable"
          @click="${() => openEntityPopover(state.entity_id)}"
        >
          ${value}${unit}
        </div>
      `
    } else {
      valueCell = html`
        <div
          class="sensor-value clickable"
          @click="${() => openEntityPopover(state.entity_id)}"
        >
          ${value}${unit}
        </div>
      `
    }
  }

  if (heading === false) {
    return valueCell
  }

  const headingResult = icon
    ? html` <ha-icon icon="${icon}"></ha-icon> `
    : html` ${heading}`

  if (_colorName) {
    return html`
      <div class="sensor-heading2">${headingResult}</div>
      ${valueCell}
    `
  } else {
    return html`
      <div class="sensor-heading">${headingResult}</div>
      ${valueCell}
    `
  }
}
