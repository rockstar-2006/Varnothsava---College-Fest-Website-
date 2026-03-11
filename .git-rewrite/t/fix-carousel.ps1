$file = "d:\web\src\components\sections\EventGrid.tsx"
$content = Get-Content $file -Raw

# The new carousel code to replace lines 572-621
$newCarouselCode = @'
                                    {/* Event Cards - Carousel: one row at a time */}
                                    <div 
                                        className="absolute inset-0 flex items-center justify-center px-8 md:px-12"
                                        style={{
                                            opacity: culturalScrollProgress > 0.2 ? 1 : 0,
                                            pointerEvents: culturalScrollProgress > 0.2 ? 'auto' : 'none'
                                        }}
                                    >
                                        <div className="relative w-full max-w-7xl">
                                            {(() => {
                                                const rows: typeof filtered[] = []
                                                for (let i = 0; i < filtered.length; i += 3) {
                                                    rows.push(filtered.slice(i, i + 3))
                                                }
                                                
                                                const rowDuration = 0.25
                                                const currentRowFloat = (culturalScrollProgress - 0.2) / rowDuration
                                                const currentRowIndex = Math.floor(currentRowFloat)
                                                const nextRowIndex = currentRowIndex + 1
                                                const rowProgress = currentRowFloat - currentRowIndex
                                                
                                                return rows.map((rowCards, rowIdx) => {
                                                    let opacity = 0
                                                    if (rowIdx === currentRowIndex) opacity = 1 - rowProgress
                                                    else if (rowIdx === nextRowIndex) opacity = rowProgress
                                                    if (opacity <= 0) return null
                                                    
                                                    return (
                                                        <div key={`row-${rowIdx}`} className="absolute inset-0 flex items-center justify-center" style={{ opacity, transition: 'opacity 0.2s ease-out' }}>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16 xl:gap-24 w-full">
                                                                {rowCards.map((event, cardIdx) => (
                                                                    <MissionCard key={event.id} event={event} idx={rowIdx * 3 + cardIdx} theme={getEventTheme(event.type)} complexClip={complexClip} isRegistered={userData?.registeredEvents?.some(re => re.id === event.id)} isLoggedIn={isLoggedIn} onRegister={handleRegisterClick} className="will-change-gpu" />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            })()}
                                        </div>
                                    </div>
'@

# Find and replace the old cards section
$pattern = '(?s){/\* Event Cards Grid - Absolutely positioned.*?</div>\s*</div>'
$content = $content -replace $pattern, $newCarouselCode

# Write back
$content | Out-File -FilePath $file -Encoding UTF8 -NoNewline

Write-Host "Carousel code updated successfully!"
