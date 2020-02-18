# vue-nested-tree

## About

### Installation

To use the nested tree interface include `NestedTree.vue` in your JavaScript and `nested-tree.scss` in your styles.

You will need to install the FontAwesome icons that you want to use in your `app.js`.

```javascript
import {library} from "@fortawesome/fontawesome-svg-core";
import {fas} from "@fortawesome/free-solid-svg-icons";
library.add(fas);
``` 

### Dependencies

This interface makes use of the following external dependencies:

* Axios `0.19.2`
* Bulma `0.8.0`
* Font Awesome Core `1.2.26`
* Fort Awesome Free `5.12.0`
* Vue `2.6.10`
* Vue Font-Awesome `0.1.9`

## Components

This interface includes four components, which are detailed below:

* Nested Tree
* Tree Row
* Tree Line
* Toggle Button

In normal use the only component you will need to include and access directly is Nested Tree.

### Nested Tree

#### Usage

Place a `<nested-tree>` tag on your page along with the required props to use the component.

This component has a `<table>` element at its base, wrapped in a Bulma `table-container` to handle overflow.

It is recommended to place the Nested Tree with minimal content to the left or right, as nested data can become quite wide when fully expanded.

A download button is provided that will export the `displayed_tree` as a CSV file.

#### Slots

| Name         | Wrapper        | Location                              |
| ------------ | -------------- | ------------------------------------- |
| header-left  | div.level-item | Top left, above table                 |
| header-right | div.level-item | Top right, above table, after toggles |

#### Props

| Name                | Type    | Required | Default | Sync | Validation      |
| ------------------- | ------- | -------- | ------- | ---- | --------------- |
| columns             | Array   | Yes      |         | No   | objectsHaveKeys |
| csv_details_fields  | Array   | Yes      |         | No   |                 |
| filter_initial_term | String  | No       |         | No   |                 |
| filter_load_url     | String  | No       |         | No   | isNotBlank      |
| filter_search_url   | String  | No       |         | No   | isNotBlank      |
| filter_placeholder  | String  | No       |         | No   |                 |
| percentage_of       | String  | No       | null    | No   |                 |
| related_url         | String  | No       | null    | No   | isNotBlank      |
| start_group         | Boolean | No       | false   | No   |                 |
| start_percented     | Boolean | No       | false   | No   |                 |
| subtree_url         | String  | No       | false   | No   | isNotBlank      |
| title               | String  | Yes      |         | No   | isNotBlank      |
| traverse_down_url   | String  | No       | false   | No   | isNotBlank      |
| traverse_up_url     | String  | No       | false   | No   |                 |
| tree                | Array   | Yes      |         | No   |                 |

##### columns

An array of objects is used to display fields held within the `data` prop while the data is ungrouped.

```
{
    columns: [
        {
            name: "Column Title",
            icon: "times-square",
            field: "data_field",
            percent: false
        }
    ]
}
``` 

| Key     | Type    | Required | Default | Description                                                   |
| ------- | ------- | -------- | ------- | ------------------------------------------------------------- |
| name    | String  | Yes      |         | The label to show when hovering over the icon                 |
| icon    | String  | Yes      |         | The font-awesome icon to display in the header                |
| field   | String  | No       | *name*  | The matching `data` field; equal to lowercase `name` if blank |
| percent | Boolean | No       | true    | Whether the column should be shown as a percent, if enabled   |

##### csv_details_fields

Which titles to give each tree node's `details` property when displayed on the CSV download.

```
csv_details_fields = [
    "Name",             // details[0]
    "Job Title",        // details[1]
    "Organisation"      // details[2]
]
```

##### filter_url

An endpoint where an updated dataset for a specific related item can be retrieved.

The request will include the ID of the top-most node to use as a reference; include a placeholder `%id` in the URL string. It will also include the related item's ID; include a placeholder '%filter' in the URL string.

When the filter is removed a request will be sent to the same endpoint with the top-most node's ID and a null filter value; in this case an unfiltered tree should be returned.

If left blank the filter select and related buttons will be hidden.

`filter_url: "endpoint/%id/filter/%filter"`

##### groups

An array of objects used to determine how to combine `data` fields, and how to display them on the table when grouping is enabled.

If left blank, the groups button will be hidden.

| Key     | Type    | Required | Default | Description                                                 |
| ------- | ------- | -------- | ------- | ----------------------------------------------------------- |
| name    | String  | Yes      |         | The label to show when hovering over the icon               |
| icon    | String  | Yes      |         | The font-awesome icon to display in the header              |
| field   | String  | Yes      |         | The data property to be used for the calculated group       |
| fields  | Array   | Yes      |         | The matching `data` fields to be added together             |
| percent | Boolean | No       | true    | Whether the column should be shown as a percent, if enabled |

```
groups: [
    {
        name: 'Confirmed',
        icon: 'check',
        field: 'confirmed',
        fields: [ "confirmed", "unavailable" ],
        percent: false
    }
]
```

##### percentage_of

To enable the percentage toggle button, provide the `data` field to be used for all calculations.

Any column or group using the `data` field will automatically be set to `percent: false`.

If left blank percentages will be disabled and the toggle button will be hidden.

`percentage_of: "data_field"`

##### related_url

A URL where a related resource can be viewed. This button is only visible when a filter is applied to the nested tree; the link will open in a new tab.

The request will include the ID of the selected filter to use as a reference; include a placeholder `%id` in the URL string.

`related_url: "my-endpoint/related/%id"`

##### start_grouped

Whether to initially display the tree using groups.

`start_grouped: true`

##### start_percented

Whether to initially display the tree using percentages.

`start_percent: true`

##### subtree_url

An endpoint where subtree data for a given ID can be loaded.

The request will include the ID of the node to use as a reference; include a placeholder `%id` in the URL string. Include a `%filter` placeholder if you wish to use filtering.

The response from the server should contain an array of "branch" objects (see the `tree` prop). Children and Subtree items will be ignored at the subtree level, and may be excluded from the response.

If left blank the subtree button will be disabled for any node without a populated subtree array.

`subtree_url: "my-endpoint/load-subtree/%id"`

##### title

The overarching description for the presented tree that will be shown in the table header, spanning the tree.

`title: "Family Member"`

##### traverse_down_url

An endpoint where data from below the current node's level can be loaded.

The request will include the ID of the node to use as a reference; include a placeholder `%id` in the URL string. Include a `%filter` placeholder if you wish to use filtering.

The response from the server should contain an array of tree objects, which may contain further children.

If left blank the "expand" button will not show for nodes where `children: true` is set.

`traverse_down_url: "my-endpoint/load-down/%id"`

##### traverse_up_url

An endpoint where data from above the current tree's level can be loaded.

The request will include the ID of the topmost node to use as a reference; include a placeholder `%id` in the URL string. Include a `%filter` placeholder if you wish to use filtering.

The response from the server should contain an array of tree objects, where one of the children matches the existing root nodes. 

Nested Tree will attempt to maintain the existing structure, however if the topmost node is not present in the response dataset the existing tree will be discarded. If the topmost node is not an immediate child of the response dataset the existing tree will be preserved but likely collapsed and hidden within the response tree structure.

If no parent is available the response should be empty or `null`.

Ensure that you provide a `parent` property on any tree nodes that have parents available; omitting the property will disable the button. 

If left blank, upward traversal will be disabled and the button will be hidden.

`traverse_up_url: "my-endpoint/load-up/%id"`

##### tree

This prop contains an array of nested "branch" objects used to display the Nested Tree.

Once provided, the information is copied and processed into two internal trees: `processed_tree` and `displayed_tree`.

* `processed_tree` is a refined copy of `raw_tree` with additional fields for visibility, groups, and percentages
* `displayed_tree` contains the table rows that are currently visible within the table, extracted from the `processed_tree`

The state of the tree is held internally in the `processed_tree`. Actions such as expanding levels or loading sub-data change `processed_tree` but do not alter the raw `tree`.

For large datasets, downward traversal allows the loading of children without requiring them in the initial tree. Any node with the `children` property set to `true` will request the data from `traverse_down_url` and merge the response array into the `processed_tree`.

Subtree data can be provided or loaded on demand in a similar manner to children, however the subtree nodes may not have any child elements. The subtree's primary purpose is to list a single level of items related to a tree node. By default users will be prompted to load related data.

When merging additional data Nested Tree will attempt to maintain the state of `processed_tree`, however if it cannot match the nodes it may revert to a collapsed state.

Changing the `tree` prop will overwrite the entire tree.

```
tree: [
    {
        id: 1,
        details: [ "Joe Red", "Job Title", "Organisation Unit" ],
        data: { recipients: 20, confirmed: 10, unavailable: 2, viewed: 4, unseen: 2, flagged: 1 },
        children: [],
        subtree: [],
        parent: true
    }
]
```

| Key      | Type            | Required | Default | Description                                                        |
| -------- | --------------- | -------- | ------- | ------------------------------------------------------------------ |
| id       | String, Integer | Yes      |         | A unique ID within the tree level                                  |
| details  | String, Array   | Yes      |         | The first value will be bolded, subsequent items will be smaller   |
| data     | Object          | Yes      |         | The data fields for the row                                        |
| children | Array, Boolean  | No       | []      | A nested array of "branch" objects, or true if they can be loaded  |
| subtree  | Array, Boolean  | No       | True    | A nested array of "subtree" objects, or true if they can be loaded |
| parent   | Boolean         | No       | False   | Whether there is a parent node available to load                   |

#### Events

| Name    | Trigger                        | Value          |
| ------- | ------------------------------ | -------------- |
| updated | The displayed tree has changed | displayed_tree |

### Tree Line

To create sharp lines that can adjust its crossbars based on the height of each table row, TreeLine uses DIVs positioned within a cell.

#### Usage

Replace a `<td>` element with a `<tree-line>` component, and pass one of the following values to the `direction` prop:

* cap-up
* cap-down
* cap-left
* cap-right
* cross
* elbow-up-left
* elbow-up-right
* elbow-down-left
* elbow-down-right
* none
* straight-vertical
* straight-horizontal
* tee-up
* tee-down
* tee-left
* tee-right

#### Props

| Name      | Type   | Required | Default | Sync | Validation          |
| --------- | ------ | -------- | ------- | ---- | ------------------- |
| direction | String | No       | none    | No   | InArray *See usage* |

### Toggle Button

#### Props

| Name      | Type    | Required | Default | Sync | Validation          |
| --------- | ------- | -------- | ------- | ---- | ------------------- |
| checked   | Boolean | No       | False   | Yes  |                     |
| label     | String  | No       | ""      | No   |                     |
| label_on  | String  | No       | ""      | No   |                     |
| label_off | String  | No       | ""      | No   |                     |

### LookupItem

#### Usage

A POST request is sent to the `lookup_url` containing the `search_term` field.

The server response must contain an array of objects with the following properties; other properties may be included but will not be parsed, though they will be available to any parent component via the `select` event:

```
[
    { id: , details: [] },
    { id: 1, details: ["Main Title", "Subtitle", ...] }
]
```

The details array should contain rows of information to allow the user to distinguish similar entries. The first item in the array will be bolded and used as the visible title if selected.

If there are no matches the server should return either an empty / null response or an empty array. 

If a term should be already present in the input box, you may pass an `initial_term`.

#### Props

| Name         | Type    | Required | Default           | Sync | Validation              |
| ------------ | ------- | -------- | ----------------- | ---- | ----------------------- |
| initial_term | String  | No       |                   | No   |                         |
| lookup_url   | String  | Yes      |                   | No   | isNotBlank()            |
| min_length   | Number  | No       | 3                 | No   | greaterThanOrEqualTo(0) |
| placeholder  | String  | No       | Type to search... | No   | isNotBlank()            |

#### Events

| Name      | Trigger                     | Value          |
| --------- | --------------------------- | -------------- |
| cleared   | The clear button is pressed |                |
| searched  | A search has been completed | search_term    |
| searching | A search has been initiated |                |
| selected  | An item has been selected   | selected_item  |
