import Immutable from 'immutable';

//From Immutable docs - https://github.com/facebook/immutable-js/wiki/Predicates
function keyInArray(keys) {
  var keySet = Immutable.Set(keys);
  return function (v, k) {

    return keySet.has(k);
  }
}

/** adds griddleKey to given collection
 * @param (List<Map>) data - data collection to work against
 * @param (object) settings - settings object -- default {}
 */
export function addKeyToCollection(data, settings={}) {
  const defaultSettings = { name: 'griddleKey', startIndex: 0 };
  const localSettings = Object.assign({}, defaultSettings, settings);

  let key = localSettings.startIndex;
  const getKey = (() => key++);

  return data.map(row => row.set(localSettings.name, getKey()));
}

/** Gets the visible data based on columns
 *  @param (List<Map>) data - data collection
 *  @param (array<string>) columns - list of columns to display
 *
 *  TODO: Needs tests
 */
export function getVisibleDataForColumns(data, columns) {
  if (data.size < 1) {
    return data;
  }

  const dataColumns = data.get(0).keySeq().toArray();

  const metadataColumns = dataColumns.filter(item => columns.indexOf(item) < 0);

  //if columns are specified but aren't in the data
  //make it up (as null). We will append this column
  //to the resultant data
  const magicColumns = columns
    .filter(item => dataColumns.indexOf(item) < 0)
    .reduce((original, item) => { original[item] = null; return original}, {})
  //combine the metadata and the "magic" columns
  const extra = data.map((d, i) => new Immutable.Map(
    Object.assign(magicColumns)
  ));

  const result = data.map(d => d.filter(keyInArray(columns)));

  return result.mergeDeep(extra)
    .map(item => item.sortBy((val, key) => columns.indexOf(key) > -1 ? columns.indexOf(key) :  MAX_SAFE_INTEGER ));
}