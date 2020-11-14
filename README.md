# [riot](https://riot.js.org/) plugin for [data-scroll-animation](https://www.npmjs.com/package/data-scroll-animation)
## Installation
`npm install data-scroll-animation`
## Usage
Anywhere before riot component mount:
```js
import "riot-scroll-animation";
```
Then inside the component export specify the `hasDataScrollAnimation` property
```riot
<component>
    <!-- component -->

    <script>
        export default {
            hasDataScrollAnimation: true,
            /* other properties and methods*/
        }
    </script>
</component>
```
