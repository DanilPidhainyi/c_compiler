export default function error (message: string, place) {
    console.error(message)
    console.log(place)
    process.exit()
}